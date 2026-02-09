import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';

import {getSupabasePublicEnv} from '@/lib/env';

import type {Database} from './database.types';

/**
 * Проверяет наличие публичного URL/anon key и бросает понятную ошибку.
 * Используется в server-side Supabase клиентах, чтобы быстро диагностировать env-проблемы.
 */
function getEnvOrThrow() {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error(
      'Supabase env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).'
    );
  }
  return env;
}

/**
 * Создаёт Supabase SSR клиент для серверного кода, который имеет право писать cookies.
 * Используется в Server Actions и route handlers (например, логин/логаут), чтобы Supabase мог обновлять auth-cookies.
 */
export async function createSupabaseServerClient() {
  const env = getEnvOrThrow();
  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({name, value, options}) => {
          cookieStore.set(name, value, options);
        });
      }
    }
  });
}

/**
 * Создаёт Supabase SSR клиент в read-only режиме для Server Components.
 * Server Components не могут модифицировать cookies, поэтому `setAll` здесь no-op;
 * ожидается, что refresh cookies будет происходить в middleware.
 */
export async function createSupabaseServerClientReadOnly() {
  const env = getEnvOrThrow();
  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Read-only context (Server Components).
        // Cookies are refreshed in `middleware.ts`.
      }
    }
  });
}
