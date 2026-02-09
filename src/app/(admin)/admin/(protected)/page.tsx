import {redirect} from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * Индекс защищённого сегмента админки.
 * Держим как простой редирект в список моделей, чтобы `/admin` имел понятную стартовую страницу.
 */
export default async function AdminIndexPage({}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  redirect('/admin/models');
}
