"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";

import { useReportPending } from "@/lib/pending";

import { languageDropdownClasses } from "./LanguageDropdown.styles";

/**
 * Собирает строку редиректа для `/api/locale`, сохраняя query-параметры.
 * Используется в `LanguageDropdown`, чтобы после смены языка пользователь оставался на той же странице.
 */
function buildRedirect(
  pathname: string,
  searchParams: URLSearchParams,
): string {
  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

function buildLocaleHref(nextLocale: "ru" | "en", redirect: string) {
  const params = new URLSearchParams();
  params.set("locale", nextLocale);
  params.set("redirect", redirect);
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

function asLocale(value: string): "ru" | "en" {
  return value === "ru" ? "ru" : "en";
}

function getFlagSrc(locale: "ru" | "en") {
  return locale === "ru" ? "/flags/ru.svg" : "/flags/en.svg";
}

function LocaleFlagIcon({ locale }: { locale: "ru" | "en" }) {
  const src = getFlagSrc(locale);
  return (
    <span aria-hidden className={languageDropdownClasses.flagWrap}>
      <Image
        src={src}
        alt=""
        width={28}
        height={20}
        className={languageDropdownClasses.flagImg}
      />
    </span>
  );
}

/**
 * Переключатель языка через cookie `locale`.
 * Используется в шапках (`TopHeader`, `AdminHeader`) и меняет язык через `/api/locale?locale=...&redirect=...`.
 */
export function LanguageDropdown() {
  const locale = asLocale(useLocale());
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  const [isPending, startTransition] = useTransition();
  useReportPending(isPending);

  const redirect = buildRedirect(pathname, searchParams);
  const hrefRu = buildLocaleHref("ru", redirect);
  const hrefEn = buildLocaleHref("en", redirect);

  function onLocaleClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
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
          headers: { "x-locale-switch": "1" },
          credentials: "same-origin",
          cache: "no-store",
        });
      } catch {
        // ignore
      }
      if (detailsRef.current) detailsRef.current.open = false;
      router.refresh();
    });
  }

  return (
    <details ref={detailsRef} className={languageDropdownClasses.root}>
      <summary className={languageDropdownClasses.summary}>
        <LocaleFlagIcon locale={locale} />
        <span>{locale.toUpperCase()}</span>
        <span aria-hidden className={languageDropdownClasses.caret}>
          ▼
        </span>
      </summary>

      <div className={languageDropdownClasses.menu}>
        <div className={languageDropdownClasses.menuInner}>
          <a
            href={hrefRu}
            aria-disabled={isPending}
            onClick={(e) => onLocaleClick(e, hrefRu)}
            className={`${languageDropdownClasses.linkBase} ${
              locale === "ru" ? languageDropdownClasses.linkActive : ""
            }`}
          >
            <LocaleFlagIcon locale="ru" />
            <span>RU</span>
          </a>
          <a
            href={hrefEn}
            aria-disabled={isPending}
            onClick={(e) => onLocaleClick(e, hrefEn)}
            className={`${languageDropdownClasses.linkBase} ${
              locale === "en" ? languageDropdownClasses.linkActive : ""
            }`}
          >
            <LocaleFlagIcon locale="en" />
            <span>EN</span>
          </a>
        </div>
      </div>
    </details>
  );
}
