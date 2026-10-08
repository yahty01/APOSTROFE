import Link from 'next/link';
import {getTranslations} from 'next-intl/server';
export default async function NotFound() {
  const t = await getTranslations('common');
  return <main className="px-4 py-12 md:px-6"><section className="ui-panel space-y-6 p-6 font-doc">
    <p className="text-sm">404</p><h1 className="text-xl uppercase tracking-wider">{t('notFound')}</h1>
    <Link href="/models" className="ui-btn-outline">{t('backToCatalog')}</Link>
  </section></main>;
}
