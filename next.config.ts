import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import path from "node:path";

/**
 * Достаёт hostname Supabase из env, чтобы разрешить `next/image` загрузку с кастомного домена.
 * Используется как optional-добавка к стандартному `**.supabase.co`.
 */
function getSupabaseHostname() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) return null;
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  images: {
    // Allow Supabase Storage images without requiring build-time env injection.
    // If you use a custom Supabase domain, set NEXT_PUBLIC_SUPABASE_URL so we can add it too.
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "**.supabase.co",
        pathname: "/storage/v1/**",
      },
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/**",
            },
          ]
        : []),
    ],
  },
};

/**
 * next-intl подключает i18n конфиг через отдельный файл (App Router).
 * Важно: путь здесь — относительный от корня проекта.
 */
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
export default withNextIntl(nextConfig);
