'use server';

import {redirect} from 'next/navigation';
import {z} from 'zod';

import {createSupabaseServerClient} from '@/lib/supabase/server';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export type LoginActionState = {
  error: string | null;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });

  if (!parsed.success) {
    return {error: 'Invalid email/password'};
  }

  const supabase = await createSupabaseServerClient();
  const {error} = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return {error: error.message};

  redirect('/admin/models');
}

