import {redirect} from 'next/navigation';
import {getLocale, getTranslations} from 'next-intl/server';

import {Marquee, type MarqueeSettings} from '@/components/Marquee';
import {AppShell} from '@/components/shell/AppShell';
import {AdminHeader} from '@/components/shell/AdminHeader';
import {Footer} from '@/components/shell/Footer';
import {createSupabaseServerClientReadOnly} from '@/lib/supabase/server';

import {adminProtectedLayoutClasses} from './layout.styles';

export const dynamic = 'force-dynamic';

/**
 * Fallback-настройки marquee для админских layout’ов на случай ошибок Supabase.
 */
const DEFAULT_MARQUEE: MarqueeSettings = {
  enabled: true,
  text_ru: '',
  text_en: '',
  speed: null,
  direction: null
};

/**
 * Layout для защищённой части админки (`/admin/...` кроме `/admin/login`).
 * Проверяет авторизацию и роль пользователя, затем оборачивает контент в `AppShell`.
 */
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

  // Роль хранится в `profiles.role` и используется для разграничения доступа к админским функциям.
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
        {/* Отдельный UI для "нет доступа", чтобы не показывать админские страницы без прав. */}
        <div className={adminProtectedLayoutClasses.deniedWrap}>
          <div className={adminProtectedLayoutClasses.deniedPanel}>
            <h1 className={adminProtectedLayoutClasses.deniedTitle}>
              {tAdmin('accessDenied')}
            </h1>
            <p className={adminProtectedLayoutClasses.deniedSubtitle}>
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
