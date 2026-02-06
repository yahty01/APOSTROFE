'use client';

import Link from 'next/link';
import {useLocale} from 'next-intl';
import {usePathname, useSearchParams} from 'next/navigation';

function buildRedirect(pathname: string, searchParams: URLSearchParams): string {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function LanguageDropdown() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const redirect = buildRedirect(pathname, searchParams);

  return (
    <details className="relative">
      <summary className="flex h-10 cursor-pointer list-none items-center gap-2 border border-[color:var(--color-line)] bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]">
        <span>{locale.toUpperCase()}</span>
        <span aria-hidden className="text-[10px]">
          ▼
        </span>
      </summary>

      <div className="absolute right-0 top-full z-30 mt-px w-28 border border-[color:var(--color-line)] bg-[var(--color-paper)]">
        <div className="grid gap-px bg-[var(--color-line)] p-px">
          <Link
            href={{pathname: '/api/locale', query: {locale: 'ru', redirect}}}
            className={`flex h-9 items-center justify-between bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)] ${
              locale === 'ru' ? 'bg-black text-white hover:bg-black' : ''
            }`}
          >
            RU
          </Link>
          <Link
            href={{pathname: '/api/locale', query: {locale: 'en', redirect}}}
            className={`flex h-9 items-center justify-between bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)] ${
              locale === 'en' ? 'bg-black text-white hover:bg-black' : ''
            }`}
          >
            EN
          </Link>
        </div>
      </div>
    </details>
  );
}

