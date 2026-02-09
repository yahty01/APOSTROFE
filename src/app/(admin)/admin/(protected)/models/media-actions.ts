'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {z} from 'zod';

import {createSupabaseServerClient} from '@/lib/supabase/server';

/**
 * Гейт по роли для загрузок/удаления медиа.
 * Используется во всех server actions ниже, чтобы ограничить доступ к Storage/DB.
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
 * Определяет "безопасное" расширение изображения на основе имени файла и mime type.
 * Используется в upload actions, чтобы не принимать неожиданные форматы и корректно формировать путь.
 */
function getSafeImageExt(fileName: string, mimeType: string) {
  const ext = fileName.split('.').pop()?.toLowerCase();
  const allowed = new Set(['jpg', 'jpeg', 'png', 'webp']);
  if (ext && allowed.has(ext)) return ext;

  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';

  return null;
}

const uploadSchema = z.object({
  asset_id: z.string().uuid()
});

type ActionResult = {ok: true} | {ok: false; error: string};

/**
 * Достаёт `document_id` ассета — он используется как "папка" для хранения файлов в Supabase Storage.
 * Вынесено отдельно, чтобы upload/delete/reorder могли переиспользовать и единообразно падать.
 */
async function getAssetDocumentId(supabase: Awaited<ReturnType<typeof requireAdminOrEditor>>, assetId: string) {
  const {data, error} = await supabase
    .from('assets')
    .select('id,document_id')
    .eq('id', assetId)
    .maybeSingle();

  if (error || !data) throw new Error(error?.message ?? 'Asset not found');
  return data.document_id;
}

/**
 * Жёсткий лимит на размер файла, чтобы не принимать слишком большие аплоады в server actions.
 * Значение согласовано с `experimental.serverActions.bodySizeLimit` в `next.config.ts`.
 */
const maxUploadBytes = 10 * 1024 * 1024;

/**
 * Server Action: загружает hero изображение (одна штука) и заменяет старое.
 * Используется в `MediaManager` и `NewModelClient`; обновляет Storage + таблицу `asset_media` и делает revalidate.
 */
export async function uploadHeroAction(formData: FormData): Promise<ActionResult> {
  const parsed = uploadSchema.safeParse({asset_id: formData.get('asset_id')});
  if (!parsed.success) return {ok: false, error: 'Invalid asset id'};

  const file = formData.get('file');
  if (!(file instanceof File)) return {ok: false, error: 'Missing file'};
  if (!file.type.startsWith('image/')) return {ok: false, error: 'Only images'};
  if (file.size > maxUploadBytes) return {ok: false, error: 'File too large'};

  const ext = getSafeImageExt(file.name, file.type);
  if (!ext) return {ok: false, error: 'Unsupported image type'};

  const supabase = await requireAdminOrEditor();
  const documentId = await getAssetDocumentId(supabase, parsed.data.asset_id);

  try {
    // Remove old hero media (best effort)
    const {data: oldHero} = await supabase
      .from('asset_media')
      .select('id,path')
      .eq('asset_id', parsed.data.asset_id)
      .eq('kind', 'hero');

    const oldPaths = (oldHero ?? []).map((m) => m.path);
    if (oldPaths.length) await supabase.storage.from('assets').remove(oldPaths);
    await supabase
      .from('asset_media')
      .delete()
      .eq('asset_id', parsed.data.asset_id)
      .eq('kind', 'hero');

    const path = `${documentId}/hero/${crypto.randomUUID()}.${ext}`;

    const {error: uploadError} = await supabase.storage.from('assets').upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false
    });
    if (uploadError) return {ok: false, error: uploadError.message};

    const {error: insertError} = await supabase.from('asset_media').insert({
      asset_id: parsed.data.asset_id,
      path,
      kind: 'hero',
      order_index: 0
    });
    if (insertError) return {ok: false, error: insertError.message};

    revalidatePath('/models');
    revalidatePath(`/models/${documentId}`);
    revalidatePath(`/admin/models/${parsed.data.asset_id}`);

    return {ok: true};
  } catch (e) {
    return {ok: false, error: e instanceof Error ? e.message : 'Upload failed'};
  }
}

/**
 * Server Action: загружает набор gallery изображений и добавляет их в конец по `order_index`.
 * Используется в `MediaManager` и `NewModelClient`.
 */
export async function uploadGalleryAction(formData: FormData): Promise<ActionResult> {
  const parsed = uploadSchema.safeParse({asset_id: formData.get('asset_id')});
  if (!parsed.success) return {ok: false, error: 'Invalid asset id'};

  const files = formData
    .getAll('files')
    .filter((f): f is File => f instanceof File);
  if (!files.length) return {ok: false, error: 'No files selected'};

  const invalidType = files.find((f) => !f.type.startsWith('image/'));
  if (invalidType) return {ok: false, error: 'Only images'};
  const tooLarge = files.find((f) => f.size > maxUploadBytes);
  if (tooLarge) return {ok: false, error: 'File too large'};
  const unsupported = files.find((f) => !getSafeImageExt(f.name, f.type));
  if (unsupported) return {ok: false, error: 'Unsupported image type'};

  const supabase = await requireAdminOrEditor();
  const documentId = await getAssetDocumentId(supabase, parsed.data.asset_id);

  const {data: last} = await supabase
    .from('asset_media')
    .select('order_index')
    .eq('asset_id', parsed.data.asset_id)
    .eq('kind', 'gallery')
    .order('order_index', {ascending: false})
    .limit(1)
    .maybeSingle();

  let nextIndex = (last?.order_index ?? -1) + 1;

  for (const file of files) {
    const ext = getSafeImageExt(file.name, file.type);
    if (!ext) return {ok: false, error: 'Unsupported image type'};

    const path = `${documentId}/gallery/${crypto.randomUUID()}.${ext}`;
    const {error: uploadError} = await supabase.storage.from('assets').upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false
    });
    if (uploadError) return {ok: false, error: uploadError.message};

    const {error: insertError} = await supabase.from('asset_media').insert({
      asset_id: parsed.data.asset_id,
      path,
      kind: 'gallery',
      order_index: nextIndex
    });
    if (insertError) return {ok: false, error: insertError.message};

    nextIndex += 1;
  }

  revalidatePath('/models');
  revalidatePath(`/models/${documentId}`);
  revalidatePath(`/admin/models/${parsed.data.asset_id}`);

  return {ok: true};
}

const moveSchema = z.object({
  asset_id: z.string().uuid(),
  media_id: z.string().uuid(),
  direction: z.enum(['up', 'down'])
});

/**
 * Server Action: меняет порядок gallery-элементов (swap с соседним по `order_index`).
 * Используется кнопками "UP/DOWN" в `MediaManager`.
 */
export async function moveGalleryMediaAction(input: unknown): Promise<ActionResult> {
  const parsed = moveSchema.safeParse(input);
  if (!parsed.success) return {ok: false, error: 'Invalid request'};

  const supabase = await requireAdminOrEditor();

  const {data: media, error} = await supabase
    .from('asset_media')
    .select('id,order_index')
    .eq('asset_id', parsed.data.asset_id)
    .eq('kind', 'gallery')
    .order('order_index', {ascending: true});

  if (error) return {ok: false, error: error.message};
  const list = media ?? [];

  const index = list.findIndex((m) => m.id === parsed.data.media_id);
  if (index === -1) return {ok: false, error: 'Not found'};

  const swapWith = parsed.data.direction === 'up' ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= list.length) return {ok: true};

  const a = list[index];
  const b = list[swapWith];

  const {error: err1} = await supabase
    .from('asset_media')
    .update({order_index: b.order_index})
    .eq('id', a.id);
  if (err1) return {ok: false, error: err1.message};

  const {error: err2} = await supabase
    .from('asset_media')
    .update({order_index: a.order_index})
    .eq('id', b.id);
  if (err2) return {ok: false, error: err2.message};

  revalidatePath(`/admin/models/${parsed.data.asset_id}`);
  return {ok: true};
}

const deleteSchema = z.object({
  asset_id: z.string().uuid(),
  media_id: z.string().uuid()
});

/**
 * Server Action: удаляет элемент медиа (storage + строка в `asset_media`).
 * Используется в `MediaManager` (кнопки remove для hero и gallery).
 */
export async function deleteMediaAction(input: unknown): Promise<ActionResult> {
  const parsed = deleteSchema.safeParse(input);
  if (!parsed.success) return {ok: false, error: 'Invalid request'};

  const supabase = await requireAdminOrEditor();
  const documentId = await getAssetDocumentId(supabase, parsed.data.asset_id);

  const {data: media, error: mediaError} = await supabase
    .from('asset_media')
    .select('id,path,kind')
    .eq('id', parsed.data.media_id)
    .eq('asset_id', parsed.data.asset_id)
    .maybeSingle();

  if (mediaError || !media) return {ok: false, error: 'Not found'};

  await supabase.storage.from('assets').remove([media.path]);
  const {error: deleteError} = await supabase
    .from('asset_media')
    .delete()
    .eq('id', parsed.data.media_id);

  if (deleteError) return {ok: false, error: deleteError.message};

  revalidatePath('/models');
  revalidatePath(`/models/${documentId}`);
  revalidatePath(`/admin/models/${parsed.data.asset_id}`);

  return {ok: true};
}
