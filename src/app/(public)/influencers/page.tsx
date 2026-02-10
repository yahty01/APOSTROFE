import {getTranslations} from 'next-intl/server';

import {registryPageClasses} from '../registryPage.styles';

export const dynamic = 'force-dynamic';

/**
 * Раздел "Influencers" (публичная часть).
 * На данный момент "coming soon"; оставлено как часть будущего реестра и для консистентной навигации.
 */
export default async function InfluencersPage({}: {
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
