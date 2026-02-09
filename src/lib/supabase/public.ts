import {createClient} from '@supabase/supabase-js';

import {getSupabasePublicEnv} from '@/lib/env';

import type {Database} from './database.types';

/**
 * Проверяет наличие обязательных переменных окружения Supabase и даёт понятную ошибку.
 * Используется только внутри `createSupabasePublicClient()`, чтобы не разносить проверки по всему коду.
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
 * Создаёт "публичный" Supabase клиент (anon key) без сохранения/авто-обновления сессии.
 * Используется в Server Components и route handlers публичной части для чтения данных.
 */
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
