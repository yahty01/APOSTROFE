'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {z} from 'zod';

import {createSupabaseServerClient} from '@/lib/supabase/server';

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

const publishSchema = z.object({
  asset_id: z.string().uuid(),
  document_id: z.string().min(1),
  next_published: z.enum(['true', 'false'])
});

export async function setPublishAction(formData: FormData) {
  const parsed = publishSchema.safeParse({
    asset_id: formData.get('asset_id'),
    document_id: formData.get('document_id'),
    next_published: formData.get('next_published')
  });
  if (!parsed.success) throw new Error('Invalid form data');

  const supabase = await requireAdminOrEditor();
  const {asset_id, document_id, next_published} = parsed.data;

  const {error} = await supabase
    .from('assets')
    .update({is_published: next_published === 'true'})
    .eq('id', asset_id);

  if (error) throw error;

  revalidatePath('/models');
  revalidatePath(`/models/${document_id}`);
  revalidatePath('/admin/models');
  revalidatePath(`/admin/models/${asset_id}`);
}

const deleteSchema = z.object({
  asset_id: z.string().uuid()
});

type DeleteResult = {ok: true; warning?: string} | {ok: false; error: string};

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function deleteAssetAction(formData: FormData): Promise<DeleteResult> {
  const parsed = deleteSchema.safeParse({
    asset_id: formData.get('asset_id')
  });
  if (!parsed.success) return {ok: false, error: 'Invalid form data'};

  const supabase = await requireAdminOrEditor();

  const {data: asset, error: assetError} = await supabase
    .from('assets')
    .select('id,document_id')
    .eq('id', parsed.data.asset_id)
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
    .eq('id', parsed.data.asset_id);

  if (deleteError) return {ok: false, error: deleteError.message};

  revalidatePath('/models');
  revalidatePath(`/models/${asset.document_id}`);
  revalidatePath('/admin/models');
  revalidatePath(`/admin/models/${asset.id}`);

  return warning ? {ok: true, warning} : {ok: true};
}
