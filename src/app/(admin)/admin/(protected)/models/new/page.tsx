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
      <h1 className="font-condensed text-[clamp(32px,4vw,52px)] leading-[0.9] uppercase tracking-[0.14em]">
        {t('createTitle')}
      </h1>
      <NewModelClient />
    </div>
  );
}
