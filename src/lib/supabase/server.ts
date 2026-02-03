import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';

import {getSupabasePublicEnv} from '@/lib/env';

import type {Database} from './database.types';

function getEnvOrThrow() {
  const env = getSupabasePublicEnv();
  if (!env) {
    throw new Error(
      'Supabase env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).'
    );
  }
  return env;
}

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

