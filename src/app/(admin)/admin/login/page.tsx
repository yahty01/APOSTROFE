import {getLocale, getTranslations} from 'next-intl/server';

import {Marquee, type MarqueeSettings} from '@/components/Marquee';
import {AppShell} from '@/components/shell/AppShell';
import {AdminHeader} from '@/components/shell/AdminHeader';
import {Footer} from '@/components/shell/Footer';
import {createSupabasePublicClient} from '@/lib/supabase/public';

import {LoginForm} from './LoginForm';

export const dynamic = 'force-dynamic';

const DEFAULT_MARQUEE: MarqueeSettings = {
  enabled: true,
  text_ru: '',
  text_en: '',
  speed: null,
  direction: null
};

export default async function AdminLoginPage({}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const locale = await getLocale();
  const t = await getTranslations('admin.login');

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
    <AppShell
      header={<AdminHeader />}
      ticker={<Marquee initial={marquee} locale={locale} />}
      footer={<Footer />}
    >
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
        <div className="ui-panel w-full p-6">
          <h1 className="font-condensed text-xl uppercase tracking-[0.12em]">
            {t('title')}
          </h1>
          <p className="mt-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            USE YOUR SUPABASE AUTH EMAIL/PASSWORD.
          </p>
          <div className="mt-6">
            <LoginForm />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
