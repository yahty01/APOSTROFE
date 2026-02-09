'use server';

import {redirect} from 'next/navigation';

import {createSupabaseServerClient} from '@/lib/supabase/server';

/**
 * Server Action: завершает сессию пользователя в Supabase и возвращает на страницу логина.
 * Используется кнопкой "SIGN OUT" в `AdminHeader`.
 */
export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
