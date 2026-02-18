"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { BrandLogoMark } from "@/components/brand/BrandLogoMark";

import { LanguageDropdown } from "./LanguageDropdown";
import { NavTabLabel } from "./NavTabLabel";
import { topHeaderClasses } from "./TopHeader.styles";

/**
 * Таб-навигация публичного раздела (верхняя панель).
 * Используется в `TopHeader` для генерации ссылок и подсветки активного таба.
 */
const TABS: {
  href: string;
  key: "models" | "creators" | "generators" | "influencers";
}[] = [
  { href: "/models", key: "models" },
  { href: "/creators", key: "creators" },
  { href: "/generators", key: "generators" },
  { href: "/influencers", key: "influencers" },
];

/**
 * Определяет активность пункта меню по текущему pathname.
 * Важно: `/models` считается активным и для вложенных страниц `/models/[document_id]`.
 */
function isActiveTab(pathname: string, href: string) {
  if (href === "/models")
    return pathname === "/models" || pathname.startsWith("/models/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Верхняя панель публичной части: бренд, табы, переключатель языка и системный статус.
 */
export function TopHeader() {
  const pathname = usePathname();
  const tNav = useTranslations("nav");

  return (
    <header className={topHeaderClasses.header}>
      <div className={topHeaderClasses.grid}>
        <div className={topHeaderClasses.brandWrap}>
          <BrandLogoMark aria-hidden className={topHeaderClasses.mark} />
          <Link href="/models" className={topHeaderClasses.brandLink}>
            Apostrofe
          </Link>
        </div>

        <nav className={topHeaderClasses.nav}>
          {TABS.map((tab) => {
            const active = isActiveTab(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`${topHeaderClasses.tab} ${
                  active ? topHeaderClasses.tabActive : ""
                }`}
              >
                <NavTabLabel text={tNav(tab.key).toUpperCase()} />
              </Link>
            );
          })}
        </nav>

        <div className={topHeaderClasses.actions}>
          <LanguageDropdown />
        </div>
      </div>
    </header>
  );
}
