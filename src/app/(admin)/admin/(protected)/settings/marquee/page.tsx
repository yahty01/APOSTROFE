import {getTranslations} from 'next-intl/server';

import {createSupabaseServerClientReadOnly} from '@/lib/supabase/server';

import {MarqueeForm} from './MarqueeForm';

export const dynamic = 'force-dynamic';

export default async function AdminMarqueeSettingsPage({}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations('admin.marquee');
  const supabase = await createSupabaseServerClientReadOnly();

  const {data, error} = await supabase
    .from('settings_marquee')
    .select('enabled,text_ru,text_en,speed,direction')
    .eq('id', 1)
    .maybeSingle();

  if (error || !data) {
    return (
      <div className="border border-red-300 bg-red-50 p-4 font-doc text-[11px] uppercase tracking-[0.16em] text-red-900">
        {error?.message ?? 'Missing settings'}
      </div>
    );
  }

  const direction = data.direction === 'right' ? 'right' : 'left';

  return (
    <div className="space-y-6">
      <h1 className="font-condensed text-[clamp(32px,4vw,52px)] leading-[0.9] uppercase tracking-[0.14em]">
        {t('title')}
      </h1>
      <div className="ui-panel p-6">
        <MarqueeForm
          initialValues={{
            enabled: data.enabled,
            text_ru: data.text_ru,
            text_en: data.text_en,
            speed: data.speed,
            direction
          }}
        />
      </div>
    </div>
  );
}
