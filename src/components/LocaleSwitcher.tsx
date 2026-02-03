'use client';

import Link from 'next/link';
import {useLocale} from 'next-intl';
import {usePathname, useSearchParams} from 'next/navigation';

function buildRedirect(pathname: string, searchParams: URLSearchParams): string {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const redirect = buildRedirect(pathname, searchParams);

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white p-1 text-xs">
      <Link
        href={{pathname: '/api/locale', query: {locale: 'ru', redirect}}}
        className={`rounded-full px-2 py-1 ${
          locale === 'ru'
            ? 'bg-black text-white'
            : 'text-black/70 hover:text-black'
        }`}
      >
        RU
      </Link>
      <Link
        href={{pathname: '/api/locale', query: {locale: 'en', redirect}}}
        className={`rounded-full px-2 py-1 ${
          locale === 'en'
            ? 'bg-black text-white'
            : 'text-black/70 hover:text-black'
        }`}
      >
        EN
      </Link>
    </div>
  );
}

