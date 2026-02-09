import {getTranslations} from 'next-intl/server';

import {NewModelClient} from './NewModelClient';
import {adminNewModelPageClasses} from './page.styles';

export const dynamic = 'force-dynamic';

/**
 * Страница создания нового ассета (`/admin/models/new`).
 * На сервере берём переводы, а весь ввод/загрузка файлов выполняются в клиентском компоненте `NewModelClient`.
 */
export default async function AdminNewModelPage({}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations('admin.modelForm');

  return (
    <div className={adminNewModelPageClasses.root}>
      <h1 className={adminNewModelPageClasses.title}>
        {t('createTitle')}
      </h1>
      <NewModelClient />
    </div>
  );
}
