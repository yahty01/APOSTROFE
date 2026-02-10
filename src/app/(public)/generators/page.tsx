import {getTranslations} from 'next-intl/server';

import {registryPageClasses} from '../registryPage.styles';

export const dynamic = 'force-dynamic';

/**
 * Раздел "Generators" (публичная часть).
 * Сейчас страница-заглушка, чтобы таб-навигация была полной и можно было постепенно наполнять контент.
 */
export default async function GeneratorsPage({}: {
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
