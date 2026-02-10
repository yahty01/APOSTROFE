import {getTranslations} from 'next-intl/server';

import {registryPageClasses} from '../registryPage.styles';

export const dynamic = 'force-dynamic';

/**
 * Раздел "Creators" (публичная часть).
 * Пока это заглушка "coming soon", но маршрут и структура уже готовы под будущий реестр.
 */
export default async function CreatorsPage({}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations('public');

  return (
    <div className={registryPageClasses.root}>
      <div className={registryPageClasses.panel}>
        {t('comingSoon')}
      </div>
    </div>
  );
}
