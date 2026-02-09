'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {z} from 'zod';

import {createSupabaseServerClient} from '@/lib/supabase/server';
import type {Json} from '@/lib/supabase/database.types';

/**
 * Схема валидации данных формы ассета.
 * Используется в `saveAssetAction()` чтобы обрабатывать и create, и update одним контрактом.
 */
const schema = z.object({
  id: z.string().uuid().optional(),
  document_id: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_-]+$/, 'Only letters, numbers, _ and -'),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  license_type: z.string().optional(),
  status: z.string().optional(),
  measurements: z.string().optional(),
  details: z.string().optional(),
  is_published: z.boolean()
});

type SaveResult =
  | {ok: true; id: string; document_id: string}
  | {ok: false; error: string};

/**
 * Гейт по роли для действий редактирования моделей.
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

  let measurements: Json | null = null;
  let details: Json | null = null;
  try {
    measurements = parseJsonOrNull(parsed.data.measurements);
    details = parseJsonOrNull(parsed.data.details);
  } catch {
    return {ok: false, error: 'Invalid JSON in measurements/details'};
  }

  const payload = {
    document_id: parsed.data.document_id,
    title: parsed.data.title,
    description: parsed.data.description?.trim() || null,
    category: parsed.data.category?.trim() || null,
    license_type: parsed.data.license_type?.trim() || null,
    status: parsed.data.status?.trim() || null,
    measurements,
    details,
    is_published: parsed.data.is_published
  };

  if (parsed.data.id) {
    const {data, error} = await supabase
      .from('assets')
      .update(payload)
      .eq('id', parsed.data.id)
      .select('id,document_id')
      .maybeSingle();

    if (error || !data) return {ok: false, error: error?.message ?? 'Not found'};

    revalidatePath('/models');
    revalidatePath(`/models/${data.document_id}`);
    revalidatePath('/admin/models');
    revalidatePath(`/admin/models/${data.id}`);

    return {ok: true, id: data.id, document_id: data.document_id};
  }

  const {data, error} = await supabase
    .from('assets')
    .insert(payload)
    .select('id,document_id')
    .maybeSingle();

  if (error || !data) return {ok: false, error: error?.message ?? 'Create failed'};

  revalidatePath('/models');
  revalidatePath(`/models/${data.document_id}`);
  revalidatePath('/admin/models');

  return {ok: true, id: data.id, document_id: data.document_id};
}
