import {redirect} from 'next/navigation';
import {getLocale, getTranslations} from 'next-intl/server';

import {Marquee, type MarqueeSettings} from '@/components/Marquee';
import {AppShell} from '@/components/shell/AppShell';
import {AdminHeader} from '@/components/shell/AdminHeader';
import {Footer} from '@/components/shell/Footer';
import {createSupabaseServerClientReadOnly} from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const DEFAULT_MARQUEE: MarqueeSettings = {
  enabled: true,
  text_ru: '',
  text_en: '',
  speed: null,
  direction: null
};

export default async function AdminProtectedLayout({
  children
}: {
  children: React.ReactNode;
  params: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const tAdmin = await getTranslations('admin');

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

  let marquee: MarqueeSettings = DEFAULT_MARQUEE;
  try {
    const {data} = await supabase
      .from('settings_marquee')
      .select('enabled,text_ru,text_en,speed,direction')
      .eq('id', 1)
      .maybeSingle();
    if (data) marquee = data;
  } catch {
    // ignore
  }

  if (!isAllowed) {
    return (
      <AppShell
        header={<AdminHeader />}
        ticker={<Marquee initial={marquee} locale={locale} />}
        footer={<Footer />}
      >
        <div className="mx-auto max-w-2xl py-16">
          <div className="ui-panel p-6">
            <h1 className="font-condensed text-xl uppercase tracking-[0.12em]">
              {tAdmin('accessDenied')}
            </h1>
            <p className="mt-3 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
              {user.email ?? user.id}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      header={<AdminHeader />}
      ticker={<Marquee initial={marquee} locale={locale} />}
      footer={<Footer />}
    >
      {children}
    </AppShell>
  );
}
