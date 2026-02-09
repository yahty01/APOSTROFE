'use client';

import {useLocale} from 'next-intl';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useTransition} from 'react';

import {useReportPending} from '@/lib/pending';

import {localeSwitcherClasses} from './LocaleSwitcher.styles';

/**
 * Собирает редирект-путь для `/api/locale`, сохраняя query-параметры.
 * Используется в `LocaleSwitcher`, чтобы смена языка не сбрасывала текущую страницу.
 */
function buildRedirect(pathname: string, searchParams: URLSearchParams): string {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function buildLocaleHref(nextLocale: 'ru' | 'en', redirect: string) {
  const params = new URLSearchParams();
  params.set('locale', nextLocale);
  params.set('redirect', redirect);
  return `/api/locale?${params.toString()}`;
}

function isPlainLeftClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey
  );
}

/**
 * Альтернативный (упрощённый) переключатель языка.
 * Сейчас компонент не подключён в layout, но может быть использован вместо `LanguageDropdown` при необходимости.
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  useReportPending(isPending);

  const redirect = buildRedirect(pathname, searchParams);
  const hrefRu = buildLocaleHref('ru', redirect);
  const hrefEn = buildLocaleHref('en', redirect);

  function onLocaleClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    if (isPending) {
      event.preventDefault();
      return;
    }

    if (!isPlainLeftClick(event)) return;

    event.preventDefault();
    startTransition(async () => {
      try {
        await fetch(href, {
          headers: {'x-locale-switch': '1'},
          credentials: 'same-origin',
          cache: 'no-store'
        });
      } catch {
        // ignore
      }
      router.refresh();
    });
  }

  return (
    <div className={localeSwitcherClasses.root}>
      <a
        href={hrefRu}
        aria-disabled={isPending}
        onClick={(e) => onLocaleClick(e, hrefRu)}
        className={`${localeSwitcherClasses.linkBase} ${
          locale === 'ru'
            ? localeSwitcherClasses.linkActive
            : localeSwitcherClasses.linkInactive
        }`}
      >
        RU
      </a>
      <a
        href={hrefEn}
        aria-disabled={isPending}
        onClick={(e) => onLocaleClick(e, hrefEn)}
        className={`${localeSwitcherClasses.linkBase} ${
          locale === 'en'
            ? localeSwitcherClasses.linkActive
            : localeSwitcherClasses.linkInactive
        }`}
      >
        EN
      </a>
    </div>
  );
}
