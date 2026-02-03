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

const archiveSchema = z.object({
  asset_id: z.string().uuid(),
  document_id: z.string().min(1)
});

export async function archiveAssetAction(formData: FormData) {
  const parsed = archiveSchema.safeParse({
    asset_id: formData.get('asset_id'),
    document_id: formData.get('document_id')
  });
  if (!parsed.success) throw new Error('Invalid form data');

  const supabase = await requireAdminOrEditor();
  const {asset_id, document_id} = parsed.data;

  const {error} = await supabase
    .from('assets')
    .update({status: 'ARCHIVED', is_published: false})
    .eq('id', asset_id);

  if (error) throw error;

  revalidatePath('/models');
  revalidatePath(`/models/${document_id}`);
  revalidatePath('/admin/models');
  revalidatePath(`/admin/models/${asset_id}`);
}
