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
  const tNav = await getTranslations('nav');

  return (
    <div className={registryPageClasses.root}>
      <header className={registryPageClasses.header}>
        <h1 className={registryPageClasses.title}>
          {tNav('generators').toUpperCase()}’
        </h1>
        <p className={registryPageClasses.subtitle}>
          {t('registry.section', {status: t('comingSoon')})}
        </p>
      </header>

      <div className={registryPageClasses.panel}>
        {t('comingSoon')}
      </div>
    </div>
  );
}
