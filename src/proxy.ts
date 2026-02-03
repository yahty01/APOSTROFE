import {createServerClient} from '@supabase/ssr';
import {NextRequest, NextResponse} from 'next/server';

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anonKey) return null;
  return {url, anonKey};
}

export async function proxy(request: NextRequest) {
  const env = getSupabaseEnv();
  if (!env) return NextResponse.next();

  let response = NextResponse.next({request});

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));
        response = NextResponse.next({request});
        cookiesToSet.forEach(({name, value, options}) => {
          response.cookies.set(name, value, options);
        });
      }
    }
  });

  // Refresh session if needed (updates cookies).
  await supabase.auth.getSession();

  return response;
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)']
};
