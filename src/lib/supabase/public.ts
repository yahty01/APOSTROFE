import {createClient} from '@supabase/supabase-js';

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

export function createSupabasePublicClient() {
  const env = getEnvOrThrow();

  return createClient<Database>(env.url, env.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
}

