'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {z} from 'zod';

import {
  getAdminBasePathForEntity,
  getPublicBasePathForEntity
} from '@/lib/assets/entity';
import {createSupabaseServerClient} from '@/lib/supabase/server';

/**
 * Гейт для всех server actions в этом модуле.
 * Используется для проверки Supabase auth + роли профиля (admin/editor) перед изменениями в БД/Storage.
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
  if (role !== 'admin' && role !== 'editor') {
    throw new Error('Access denied');
  }

  return supabase;
}

/**
 * Схема формы publish/unpublish в списках сущностей реестра.
 */
const publishSchema = z.object({
  asset_id: z.string().uuid(),
  document_id: z.string().min(1),
  entity_type: z.enum(['model', 'creator', 'influencer']),
  next_published: z.enum(['true', 'false'])
});

/**
 * Server Action: переключает флаг публикации ассета.
 * Вызывается формой в таблицах админки; валидирует FormData через Zod и делает `revalidatePath`.
 */
export async function setPublishAction(formData: FormData) {
  const parsed = publishSchema.safeParse({
    asset_id: formData.get('asset_id'),
    document_id: formData.get('document_id'),
    entity_type: formData.get('entity_type'),
    next_published: formData.get('next_published')
  });
  if (!parsed.success) throw new Error('Invalid form data');

  const supabase = await requireAdminOrEditor();
  const {asset_id, document_id, entity_type, next_published} = parsed.data;
  const publicBase = getPublicBasePathForEntity(entity_type);
  const adminBase = getAdminBasePathForEntity(entity_type);

  const {error} = await supabase
    .from('assets')
    .update({is_published: next_published === 'true'})
    .eq('id', asset_id)
    .eq('entity_type', entity_type);

  if (error) throw error;

  revalidatePath(publicBase);
  if (entity_type === 'model') revalidatePath(`/models/${document_id}`);
  revalidatePath(adminBase);
  revalidatePath(`${adminBase}/${asset_id}`);
}

const deleteSchema = z.object({
  asset_id: z.string().uuid(),
  entity_type: z.enum(['model', 'creator', 'influencer'])
});

type DeleteResult = {ok: true; warning?: string} | {ok: false; error: string};

/**
 * Разбивает список на чанки фиксированного размера.
 * Используется при удалении файлов из Supabase Storage, чтобы не превысить лимиты на размер запроса.
 */
function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Server Action: удаляет ассет + связанные медиа-файлы.
 * Вызывается из `DeleteAssetButton`; старается удалить storage-файлы "best effort" и возвращает warning,
 * если storage cleanup частично не удался.
 */
export async function deleteAssetAction(formData: FormData): Promise<DeleteResult> {
  const parsed = deleteSchema.safeParse({
    asset_id: formData.get('asset_id'),
    entity_type: formData.get('entity_type')
  });
  if (!parsed.success) return {ok: false, error: 'Invalid form data'};

  const supabase = await requireAdminOrEditor();
  const entityType = parsed.data.entity_type;
  const publicBase = getPublicBasePathForEntity(entityType);
  const adminBase = getAdminBasePathForEntity(entityType);

  const {data: asset, error: assetError} = await supabase
    .from('assets')
    .select('id,document_id')
    .eq('id', parsed.data.asset_id)
    .eq('entity_type', entityType)
    .maybeSingle();

  if (assetError || !asset) {
    return {ok: false, error: assetError?.message ?? 'Not found'};
  }

  const {data: media, error: mediaError} = await supabase
    .from('asset_media')
    .select('path')
    .eq('asset_id', parsed.data.asset_id);

  if (mediaError) return {ok: false, error: mediaError.message};

  const paths = (media ?? [])
    .map((m) => m.path)
    .filter((p): p is string => typeof p === 'string' && p.length > 0);

  let warning: string | undefined;
  for (const chunk of chunkArray(paths, 100)) {
    const {error: removeError} = await supabase.storage.from('assets').remove(chunk);
    if (removeError && !warning) warning = removeError.message;
  }

  const {error: deleteError} = await supabase
    .from('assets')
    .delete()
    .eq('id', parsed.data.asset_id)
    .eq('entity_type', entityType);

  if (deleteError) return {ok: false, error: deleteError.message};

  revalidatePath(publicBase);
  if (entityType === 'model') revalidatePath(`/models/${asset.document_id}`);
  revalidatePath(adminBase);
  revalidatePath(`${adminBase}/${asset.id}`);

  return warning ? {ok: true, warning} : {ok: true};
}
