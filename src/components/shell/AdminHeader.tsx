"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

import { signOutAction } from "@/app/(admin)/admin/actions";
import { BrandLogoMark } from "@/components/brand/BrandLogoMark";
import { PendingFormStatusReporter } from "@/components/pending/PendingFormStatusReporter";

import { LanguageDropdown } from "./LanguageDropdown";
import { adminHeaderClasses } from "./AdminHeader.styles";
import { NavTabLabel } from "./NavTabLabel";

/**
 * Таб-навигация админского раздела.
 * Используется для генерации ссылок и подсветки активного таба.
 */
const TABS: {
  href: string;
  key: 'models' | 'creators' | 'influencers' | 'marquee' | 'public';
}[] = [
  { href: "/admin/models", key: "models" },
  { href: "/admin/creators", key: "creators" },
  { href: "/admin/influencers", key: "influencers" },
  { href: "/admin/settings/marquee", key: "marquee" },
  { href: "/models", key: "public" },
];

/**
 * Подсветка активного таба по pathname.
 * "PUBLIC’" сознательно не подсвечиваем как активный таб, чтобы не путать контексты.
 */
function isActiveTab(pathname: string, href: string) {
  if (href === "/models") return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Верхняя панель админки: бренд, навигация, переключатель языка, системный статус и кнопка выхода.
 * Кнопка "SIGN OUT" скрыта на странице логина, чтобы не рендерить бессмысленную форму.
 */
export function AdminHeader() {
  const tNav = useTranslations("nav");
  const tAdmin = useTranslations("admin");
  const pathname = usePathname();
  const showSignOut = !pathname.startsWith("/admin/login");

  return (
    <header className={adminHeaderClasses.header}>
      <div className={adminHeaderClasses.grid}>
        <div className={adminHeaderClasses.brandWrap}>
          <BrandLogoMark aria-hidden className={adminHeaderClasses.mark} />
          <Link href="/admin/models" className={adminHeaderClasses.brandLink}>
            APOSTROPHE
          </Link>
        </div>

        <nav className={adminHeaderClasses.nav}>
          {TABS.map((tab) => {
            const active = isActiveTab(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`${adminHeaderClasses.tab} ${
                  active ? adminHeaderClasses.tabActive : ""
                }`}
              >
                <NavTabLabel text={tNav(tab.key).toUpperCase()} />
              </Link>
            );
          })}
        </nav>

        <div className={adminHeaderClasses.actions}>
          <LanguageDropdown />
          {showSignOut ? (
            <form action={signOutAction}>
              <PendingFormStatusReporter />
              <button
                type="submit"
                className={adminHeaderClasses.signOutButton}
              >
                {tAdmin("signOut").toUpperCase()}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  );
}
