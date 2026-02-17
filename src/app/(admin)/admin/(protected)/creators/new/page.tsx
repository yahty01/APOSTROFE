import {getTranslations} from 'next-intl/server';

import {NewModelClient} from '../../models/new/NewModelClient';
import {adminNewModelPageClasses} from '../../models/new/page.styles';

export const dynamic = 'force-dynamic';

export default async function AdminNewCreatorPage({}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations('admin.creators');

  return (
    <div className={adminNewModelPageClasses.root}>
      <h1 className={adminNewModelPageClasses.title}>{t('create')}</h1>
      <NewModelClient
        entityType="creator"
        redirectBasePath="/admin/creators"
        withMedia
        allowHero={false}
        allowGallery
      />
    </div>
  );
}
