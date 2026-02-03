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
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        {error?.message ?? 'Missing settings'}
      </div>
    );
  }

  const direction = data.direction === 'right' ? 'right' : 'left';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
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
