import {getTranslations} from 'next-intl/server';

import {NewModelClient} from './NewModelClient';

export const dynamic = 'force-dynamic';

export default async function AdminNewModelPage({}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations('admin.modelForm');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{t('createTitle')}</h1>
      <NewModelClient />
    </div>
  );
}
