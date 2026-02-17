'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {z} from 'zod';

import {
  getAdminBasePathForEntity,
  getPublicBasePathForEntity,
  type AssetEntityType
} from '@/lib/assets/entity';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {Json} from '@/lib/supabase/database.types';

/**
 * Схема валидации данных формы ассета.
 * Используется в `saveAssetAction()` чтобы обрабатывать и create, и update одним контрактом.
 */
const schema = z.object({
  id: z.string().uuid().optional(),
  entity_type: z.enum(['model', 'creator', 'influencer']).default('model'),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  model_type: z.string().optional(),
  creator_direction: z.string().optional(),
  influencer_topic: z.string().optional(),
  influencer_platforms: z.string().optional(),
  license_type: z.string().optional(),
  status: z.string().optional(),
  measurements: z.string().optional(),
  details: z.string().optional(),
  is_published: z.boolean()
});

type SaveResult =
  | {ok: true; id: string; document_id: string; entity_type: AssetEntityType}
  | {ok: false; error: string};

/**
 * Гейт по роли для действий редактирования сущностей реестра.
 * Общий для create/update, чтобы не дублировать проверку по всем server actions.
 */
async function requireAdminOrEditor() {
  const supabase = await createSupabaseServerClient();
  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const {data: profile} = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = profile?.role;
  if (role !== 'admin' && role !== 'editor') throw new Error('Access denied');

  return supabase;
}

/**
 * Парсит JSON из textarea и возвращает `null` для пустого значения.
 * Используется для полей `measurements`/`details`, которые хранятся как JSON в базе.
 */
function parseJsonOrNull(value: string | undefined): Json | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed) as Json;
}

function asNullableText(value: string | undefined) {
  const text = (value ?? '').trim();
  return text || null;
}

const documentIdMaxBaseLength = 56;

function slugifyDocumentIdPart(value: string) {
  const normalized = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized;
}

function buildGeneratedDocumentId(entityType: AssetEntityType, title: string) {
  const slug = slugifyDocumentIdPart(title);
  const baseRaw = slug ? `${entityType}-${slug}` : entityType;
  const base = baseRaw.slice(0, documentIdMaxBaseLength).replace(/-+$/g, '') || entityType;
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 6);
  return `${base}-${suffix}`;
}

type SupabaseWriteError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

function isDocumentIdUniqueViolation(error: SupabaseWriteError | null | undefined) {
  if (!error) return false;
  const source = `${error.code ?? ''} ${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`;
  return error.code === '23505' || source.includes('assets_document_id_key');
}

/**
 * Server Action: создаёт/обновляет ассет.
 * Вызывается из `AssetForm`: валидирует входные данные, нормализует строки, парсит JSON-поля,
 * и делает `revalidatePath` для публичных и админских маршрутов.
 */
export async function saveAssetAction(input: unknown): Promise<SaveResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {ok: false, error: 'Validation failed'};
  }

  const supabase = await requireAdminOrEditor();
  const entityType = parsed.data.entity_type;
  const publicBase = getPublicBasePathForEntity(entityType);
  const adminBase = getAdminBasePathForEntity(entityType);

  let measurements: Json | null = null;
  let details: Json | null = null;
  if (entityType === 'model') {
    try {
      measurements = parseJsonOrNull(parsed.data.measurements);
      details = parseJsonOrNull(parsed.data.details);
    } catch {
      return {ok: false, error: 'Invalid JSON in measurements/details'};
    }
  }

  const modelType = asNullableText(parsed.data.model_type) ?? asNullableText(parsed.data.category);
  const creatorDirection = asNullableText(parsed.data.creator_direction);
  const influencerTopic = asNullableText(parsed.data.influencer_topic);
  const influencerPlatforms = asNullableText(parsed.data.influencer_platforms);

  const payload = {
    entity_type: entityType,
    title: parsed.data.title,
    description: asNullableText(parsed.data.description),
    category: entityType === 'model' ? modelType : null,
    model_type: entityType === 'model' ? modelType : null,
    creator_direction: entityType === 'creator' ? creatorDirection : null,
    influencer_topic: entityType === 'influencer' ? influencerTopic : null,
    influencer_platforms: entityType === 'influencer' ? influencerPlatforms : null,
    license_type: asNullableText(parsed.data.license_type),
    status: entityType === 'influencer' ? null : asNullableText(parsed.data.status),
    measurements: entityType === 'model' ? measurements : null,
    details: entityType === 'model' ? details : null,
    is_published: parsed.data.is_published
  };

  if (parsed.data.id) {
    const {data, error} = await supabase
      .from('assets')
      .update(payload)
      .eq('id', parsed.data.id)
      .eq('entity_type', entityType)
      .select('id,document_id')
      .maybeSingle();

    if (error || !data) return {ok: false, error: error?.message ?? 'Not found'};

    revalidatePath(publicBase);
    if (entityType === 'model') revalidatePath(`/models/${data.document_id}`);
    revalidatePath(adminBase);
    revalidatePath(`${adminBase}/${data.id}`);

    return {
      ok: true,
      id: data.id,
      document_id: data.document_id,
      entity_type: entityType
    };
  }

  let created: {id: string; document_id: string} | null = null;
  let createError: SupabaseWriteError | null = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const documentId = buildGeneratedDocumentId(entityType, parsed.data.title);
    const {data, error} = await supabase
      .from('assets')
      .insert({
        ...payload,
        document_id: documentId
      })
      .select('id,document_id')
      .maybeSingle();

    if (!error && data) {
      created = data;
      createError = null;
      break;
    }

    createError = error;
    if (!isDocumentIdUniqueViolation(error)) break;
  }

  if (!created) {
    return {ok: false, error: createError?.message ?? 'Create failed'};
  }

  revalidatePath(publicBase);
  if (entityType === 'model') revalidatePath(`/models/${created.document_id}`);
  revalidatePath(adminBase);

  return {
    ok: true,
    id: created.id,
    document_id: created.document_id,
    entity_type: entityType
  };
}
