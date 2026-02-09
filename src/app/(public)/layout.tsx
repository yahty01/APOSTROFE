import {cookies} from 'next/headers';
import {getLocale} from 'next-intl/server';

import {Marquee, type MarqueeSettings} from '@/components/Marquee';
import {AppShell} from '@/components/shell/AppShell';
import {Footer} from '@/components/shell/Footer';
import {TopHeader} from '@/components/shell/TopHeader';
import {createSupabasePublicClient} from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

/**
 * Значения по умолчанию для marquee, если Supabase недоступен или настройки ещё не созданы.
 * Используется в public/admin layout’ах как безопасный fallback.
 */
const DEFAULT_MARQUEE: MarqueeSettings = {
  enabled: true,
  text_ru: '',
  text_en: '',
  speed: null,
  direction: null
};

type ViewMode = 'cards' | 'list';

function asViewMode(value: string | undefined): ViewMode | null {
  if (value === 'cards' || value === 'list') return value;
  return null;
}

/**
 * Layout публичной части (сегмент `(public)`).
 * Оборачивает все публичные страницы в `AppShell` и подмешивает ticker `Marquee` с initial данными из Supabase.
 */
export default async function PublicLayout({
  children
}: {
  children: React.ReactNode;
  params: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  const initialModelsView =
    asViewMode(cookieStore.get('models_view')?.value) ?? 'cards';

  const locale = await getLocale();

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
      header={<TopHeader initialModelsView={initialModelsView} />}
      ticker={<Marquee initial={marquee} locale={locale} />}
      footer={<Footer />}
    >
      {children}
    </AppShell>
  );
}
