'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

import {signOutAction} from '@/app/(admin)/admin/actions';

import {LanguageDropdown} from './LanguageDropdown';
import {SystemStatus} from './SystemStatus';

const TABS: {href: string; label: string}[] = [
  {href: '/admin/models', label: "MODELS’"},
  {href: '/admin/settings/marquee', label: "MARQUEE’"},
  {href: '/models', label: "PUBLIC’"}
];

function isActiveTab(pathname: string, href: string) {
  if (href === '/models') return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminHeader() {
  const pathname = usePathname();
  const showSignOut = !pathname.startsWith('/admin/login');

  return (
    <header className="border-b ui-line">
      <div className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="flex items-center gap-3">
          <div aria-hidden className="h-5 w-5 bg-black" />
          <Link
            href="/admin/models"
            className="font-condensed text-sm uppercase tracking-[0.22em]"
          >
            APOSTROPHE
          </Link>
        </div>

        <nav className="flex flex-wrap items-center gap-2 md:justify-center">
          {TABS.map((tab) => {
            const active = isActiveTab(pathname, tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`ui-tab ${active ? 'ui-tab--active' : ''}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-2 md:justify-end">
          <LanguageDropdown />
          <SystemStatus />
          {showSignOut ? (
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex h-10 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]"
              >
                SIGN OUT
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </header>
  );
}
