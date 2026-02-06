import {getLocale} from 'next-intl/server';

import {Marquee, type MarqueeSettings} from '@/components/Marquee';
import {AppShell} from '@/components/shell/AppShell';
import {Footer} from '@/components/shell/Footer';
import {TopHeader} from '@/components/shell/TopHeader';
import {createSupabasePublicClient} from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

const DEFAULT_MARQUEE: MarqueeSettings = {
  enabled: true,
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
      header={<TopHeader />}
      ticker={<Marquee initial={marquee} locale={locale} />}
      footer={<Footer />}
    >
      {children}
    </AppShell>
  );
}
