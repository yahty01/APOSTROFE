export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

/**
 * Достаёт публичные переменные Supabase из окружения.
 * Используется и на сервере, и на клиенте для создания Supabase-клиента (anon/publishable key).
 * Возвращает `null`, чтобы вызывающий код мог аккуратно деградировать без Supabase.
 */
export function getSupabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) return null;
  return {url, anonKey};
}

/**
 * Читает service role key (только для серверного кода).
 * Используется для админских/фоновых задач, где нужны привилегии выше anon key.
 * Никогда не должен попадать в клиентский бандл.
 */
export function getSupabaseServiceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;
}
