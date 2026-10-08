'use server';

import {redirect} from 'next/navigation';
import {z} from 'zod';
import {getTranslations} from 'next-intl/server';

import {createSupabaseServerClient} from '@/lib/supabase/server';

/**
 * Схема валидации логина из `<form>`.
 * Используется в server action, чтобы не принимать "плохие" значения из FormData.
 */
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

/**
 * Состояние для `useActionState()` в `LoginForm`.
 * Храним только человекочитаемую ошибку, чтобы не протаскивать лишние детали в UI.
 */
export type LoginActionState = {
  error: string | null;
};

/**
 * Server Action: логин через Supabase email/password.
 * Используется формой `/admin/login`; валидирует FormData, выполняет `signInWithPassword`,
 * и редиректит на `/admin/models` при успехе.
 */
export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const t = await getTranslations('admin.login');
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });

  if (!parsed.success) {
    return {error: t('invalidCredentials')};
  }

  const supabase = await createSupabaseServerClient();
  const {error} = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return {error: t(error.code === 'invalid_credentials' ? 'invalidCredentials' : 'error')};

  redirect('/admin/models');
}
