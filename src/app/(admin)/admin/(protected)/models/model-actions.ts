'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {z} from 'zod';
import {getTranslations} from 'next-intl/server';
import {englishFormFields} from '@/lib/assets/translation-form';
import {readAssetLocalization, writeAssetLocalization, translatedTextFields, type AssetTranslation} from '@/lib/assets/localization';

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
  title: z.string().trim().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  model_type: z.string().optional(),
  creator_direction: z.string().optional(),
  influencer_topic: z.string().optional(),
  influencer_platforms: z.string().optional(),
  influencer_instagram_url: z.string().optional(),
  influencer_youtube_url: z.string().optional(),
  influencer_tiktok_url: z.string().optional(),
  influencer_telegram_url: z.string().optional(),
  influencer_vk_url: z.string().optional(),
  influencer_yandex_music_url: z.string().optional(),
  influencer_spotify_url: z.string().optional(),
  license_type: z.string().optional(),
  status: z.string().optional(),
  measurements: z.string().optional(),
  details: z.string().optional(),
  ...englishFormFields,
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

/**
 * Нормализует URL-поле: пустое значение -> `null`, непустое должно быть `http/https`.
 * Возвращает флаг валидности, чтобы прервать сохранение до записи в БД.
 */
function asNullableHttpUrl(value: string | undefined) {
  const text = (value ?? '').trim();
  if (!text) return {value: null as string | null, isValid: true};

  try {
    const url = new URL(text);
    const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
    if (!isHttp) return {value: null as string | null, isValid: false};
    return {value: text, isValid: true};
  } catch {
    return {value: null as string | null, isValid: false};
  }
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
 * проверяет URL полей соцсетей инфлюенсера и делает `revalidatePath` для публичных/админских маршрутов.
 */
export async function saveAssetAction(input: unknown): Promise<SaveResult> {
  const t = await getTranslations('admin.modelForm.errors');
  const tToast = await getTranslations('admin.toast');
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {ok: false, error: t('validationFailed')};
  }

  const supabase = await requireAdminOrEditor();
  const entityType = parsed.data.entity_type;
  const publicBase = getPublicBasePathForEntity(entityType);
  const adminBase = getAdminBasePathForEntity(entityType);

  let previousDetails: Json | null = null;
  if (parsed.data.id) {
    const previous = await supabase.from('assets').select('details').eq('id', parsed.data.id).eq('entity_type', entityType).maybeSingle();
    if (previous.error || !previous.data) return {ok: false, error: tToast('error')};
    previousDetails = previous.data.details;
  }
  const previousLocalization = readAssetLocalization(previousDetails);
  let measurements: Json | null = null;
  let baseDetails: Json | null = previousLocalization.base;
  let english: AssetTranslation = previousLocalization.en;
  try {
    if (entityType === 'model') {
      measurements = parseJsonOrNull(parsed.data.measurements);
      baseDetails = readAssetLocalization(parseJsonOrNull(parsed.data.details)).base;
    }
    // Older open forms can still save without erasing previously saved translations.
    if (Object.keys(englishFormFields).some((key) => key in parsed.data)) {
      english = {};
      for (const key of translatedTextFields) {
        const value = parsed.data[`${key}_en`];
        if (value?.trim()) english[key] = value.trim();
      }
      if (entityType === 'model') {
        english.measurements = parseJsonOrNull(parsed.data.measurements_en);
        english.details = parseJsonOrNull(parsed.data.details_en);
      }
    }
  } catch {
    return {ok: false, error: t('invalidJson')};
  }
  const details = writeAssetLocalization(baseDetails, english);

  const modelType = asNullableText(parsed.data.model_type) ?? asNullableText(parsed.data.category);
  const creatorDirection = asNullableText(parsed.data.creator_direction);
  const influencerTopic = asNullableText(parsed.data.influencer_topic);
  const influencerPlatforms = asNullableText(parsed.data.influencer_platforms);
  const influencerInstagramUrl = asNullableHttpUrl(parsed.data.influencer_instagram_url);
  const influencerYoutubeUrl = asNullableHttpUrl(parsed.data.influencer_youtube_url);
  const influencerTiktokUrl = asNullableHttpUrl(parsed.data.influencer_tiktok_url);
  const influencerTelegramUrl = asNullableHttpUrl(parsed.data.influencer_telegram_url);
  const influencerVkUrl = asNullableHttpUrl(parsed.data.influencer_vk_url);
  const influencerYandexMusicUrl = asNullableHttpUrl(parsed.data.influencer_yandex_music_url);
  const influencerSpotifyUrl = asNullableHttpUrl(parsed.data.influencer_spotify_url);

  const invalidSocialUrl = [
    influencerInstagramUrl,
    influencerYoutubeUrl,
    influencerTiktokUrl,
    influencerTelegramUrl,
    influencerVkUrl,
    influencerYandexMusicUrl,
    influencerSpotifyUrl
  ].some((entry) => !entry.isValid);

  if (invalidSocialUrl) {
    return {ok: false, error: t('invalidUrl')};
  }

  const payload = {
    entity_type: entityType,
    title: parsed.data.title.trim(),
    description: asNullableText(parsed.data.description),
    category: entityType === 'model' ? modelType : null,
    model_type: entityType === 'model' ? modelType : null,
    creator_direction: entityType === 'creator' ? creatorDirection : null,
    influencer_topic: entityType === 'influencer' ? influencerTopic : null,
    influencer_platforms: entityType === 'influencer' ? influencerPlatforms : null,
    influencer_instagram_url:
      entityType === 'influencer' ? influencerInstagramUrl.value : null,
    influencer_youtube_url:
      entityType === 'influencer' ? influencerYoutubeUrl.value : null,
    influencer_tiktok_url:
      entityType === 'influencer' ? influencerTiktokUrl.value : null,
    influencer_telegram_url:
      entityType === 'influencer' ? influencerTelegramUrl.value : null,
    influencer_vk_url: entityType === 'influencer' ? influencerVkUrl.value : null,
    influencer_yandex_music_url:
      entityType === 'influencer' ? influencerYandexMusicUrl.value : null,
    influencer_spotify_url:
      entityType === 'influencer' ? influencerSpotifyUrl.value : null,
    license_type: asNullableText(parsed.data.license_type),
    status: entityType === 'influencer' ? null : asNullableText(parsed.data.status),
    measurements: entityType === 'model' ? measurements : null,
    details,
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

    if (error || !data) return {ok: false, error: tToast('error')};

    revalidatePath(publicBase);
    revalidatePath(`${publicBase}/${data.document_id}`);
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
      break;
    }

    if (!isDocumentIdUniqueViolation(error)) break;
  }

  if (!created) {
    return {ok: false, error: tToast('error')};
  }

  revalidatePath(publicBase);
  revalidatePath(`${publicBase}/${created.document_id}`);
  revalidatePath(adminBase);

  return {
    ok: true,
    id: created.id,
    document_id: created.document_id,
    entity_type: entityType
  };
}
