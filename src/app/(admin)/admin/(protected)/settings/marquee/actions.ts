'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {z} from 'zod';

import {createSupabaseServerClient} from '@/lib/supabase/server';

const schema = z.object({
  enabled: z.boolean(),
  text_ru: z.string().max(5000).optional(),
  text_en: z.string().max(5000).optional(),
  speed: z.number().int().positive().nullable(),
  direction: z.enum(['left', 'right'])
});

type SaveResult = {ok: true} | {ok: false; error: string};

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

export async function saveMarqueeSettingsAction(input: unknown): Promise<SaveResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return {ok: false, error: 'Validation failed'};

  const supabase = await requireAdminOrEditor();

  const {error} = await supabase
    .from('settings_marquee')
    .update({
      enabled: parsed.data.enabled,
      text_ru: parsed.data.text_ru ?? '',
      text_en: parsed.data.text_en ?? '',
      speed: parsed.data.speed,
      direction: parsed.data.direction
    })
    .eq('id', 1);

  if (error) return {ok: false, error: error.message};

  revalidatePath('/models');
  revalidatePath('/admin/settings/marquee');
  return {ok: true};
}
