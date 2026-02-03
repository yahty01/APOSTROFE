import Link from 'next/link';
import {getLocale, getTranslations} from 'next-intl/server';

import {LocaleSwitcher} from '@/components/LocaleSwitcher';
import {Marquee, type MarqueeSettings} from '@/components/Marquee';
import {createSupabasePublicClient} from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

const DEFAULT_MARQUEE: MarqueeSettings = {
  enabled: false,
  text_ru: '',
  text_en: '',
  speed: null,
  direction: null
};

export default async function PublicLayout({
  children
}: {
  children: React.ReactNode;
  params: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const tApp = await getTranslations('app');
  const tNav = await getTranslations('nav');

  let marquee: MarqueeSettings = DEFAULT_MARQUEE;
  try {
    const supabase = createSupabasePublicClient();
    const {data} = await supabase
      .from('settings_marquee')
      .select('enabled,text_ru,text_en,speed,direction')
      .eq('id', 1)
      .maybeSingle();
    if (data) marquee = data;
  } catch {
    // ignore
  }

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/models" className="font-semibold tracking-tight">
              {tApp('name')}
            </Link>
            <nav className="hidden items-center gap-3 text-sm text-black/70 sm:flex">
              <Link href="/models" className="hover:text-black">
                {tNav('models')}
              </Link>
              <Link href="/admin" className="hover:text-black">
                {tNav('admin')}
              </Link>
            </nav>
          </div>
          <LocaleSwitcher />
        </div>
        <Marquee initial={marquee} locale={locale} />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

      <footer className="border-t border-black/10 py-10 text-center text-sm text-black/60">
        © {new Date().getFullYear()} {tApp('name')}
      </footer>
    </div>
  );
}

