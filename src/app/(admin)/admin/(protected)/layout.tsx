import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getTranslations} from 'next-intl/server';

import {signOutAction} from '@/app/(admin)/admin/actions';
import {createSupabaseServerClientReadOnly} from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminProtectedLayout({
  children
}: {
  children: React.ReactNode;
  params: Promise<Record<string, string | string[] | undefined>>;
}) {
  const tAdmin = await getTranslations('admin');
  const tNav = await getTranslations('nav');

  const supabase = await createSupabaseServerClientReadOnly();
  const {
    data: {user}
  } = await supabase.auth.getUser();

  if (!user) redirect('/admin/login');

  const {data: profile} = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  const role = profile?.role;
  const isAllowed = role === 'admin' || role === 'editor';

  if (!isAllowed) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">
            {tAdmin('accessDenied')}
          </h1>
          <p className="mt-2 text-sm text-black/70">
            {user.email ?? user.id}
          </p>
          <form action={signOutAction} className="mt-6">
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white hover:bg-black/90"
            >
              {tAdmin('signOut')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/models" className="text-black/70 hover:text-black">
              ← {tNav('models')}
            </Link>
            <span className="text-black/20">/</span>
            <Link href="/admin/models" className="text-black/70 hover:text-black">
              {tNav('admin')}
            </Link>
            <Link
              href="/admin/settings/marquee"
              className="text-black/70 hover:text-black"
            >
              {tNav('marquee')}
            </Link>
          </nav>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white px-3 text-sm text-black/80 hover:bg-black/5"
            >
              {tAdmin('signOut')}
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}

