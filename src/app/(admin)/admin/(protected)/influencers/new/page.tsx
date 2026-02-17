import {getTranslations} from 'next-intl/server';

import {NewModelClient} from '../../models/new/NewModelClient';
import {adminNewModelPageClasses} from '../../models/new/page.styles';

export const dynamic = 'force-dynamic';

export default async function AdminNewInfluencerPage({}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations('admin.influencers');

  return (
    <div className={adminNewModelPageClasses.root}>
      <h1 className={adminNewModelPageClasses.title}>{t('create')}</h1>
      <NewModelClient entityType="influencer" redirectBasePath="/admin/influencers" />
    </div>
  );
}
