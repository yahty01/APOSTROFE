import {getTranslations} from 'next-intl/server';

import {createSupabaseServerClientReadOnly} from '@/lib/supabase/server';

import {MarqueeForm} from './MarqueeForm';
import {adminMarqueeSettingsPageClasses} from './page.styles';

export const dynamic = 'force-dynamic';

/**
 * Админская страница настроек marquee (`/admin/settings/marquee`).
 * Загружает текущие настройки на сервере и передаёт их в клиентскую форму `MarqueeForm`.
 */
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
      <div className={adminMarqueeSettingsPageClasses.error}>
        {error?.message ?? t('missingSettings')}
      </div>
    );
  }

  const direction = data.direction === 'right' ? 'right' : 'left';

  return (
    <div className={adminMarqueeSettingsPageClasses.root}>
      <h1 className={adminMarqueeSettingsPageClasses.title}>
        {t('title')}
      </h1>
      <div className={adminMarqueeSettingsPageClasses.panel}>
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
