import {getLocale, getTranslations} from 'next-intl/server';

import {Marquee, type MarqueeSettings} from '@/components/Marquee';
import {AppShell} from '@/components/shell/AppShell';
import {AdminHeader} from '@/components/shell/AdminHeader';
import {Footer} from '@/components/shell/Footer';
import {createSupabasePublicClient} from '@/lib/supabase/public';

import {LoginForm} from './LoginForm';
import {adminLoginPageClasses} from './page.styles';

export const dynamic = 'force-dynamic';

/**
 * Fallback-настройки marquee на случай ошибок Supabase.
 * Используется для initial рендера, чтобы шапка/тикер не ломались без данных.
 */
const DEFAULT_MARQUEE: MarqueeSettings = {
  enabled: true,
  text_ru: '',
  text_en: '',
  speed: null,
  direction: null
};

/**
 * Страница логина админки (`/admin/login`).
 * Подгружает locale и initial-настройки marquee на сервере и рендерит `LoginForm`.
 */
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
      <div className={adminLoginPageClasses.root}>
        <div className={adminLoginPageClasses.panel}>
          <h1 className={adminLoginPageClasses.title}>
            {t('title')}
          </h1>
          <p className={adminLoginPageClasses.subtitle}>
            {t('subtitle')}
          </p>
          <div className={adminLoginPageClasses.form}>
            <LoginForm />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
