'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

import {LanguageDropdown} from './LanguageDropdown';
import {SystemStatus} from './SystemStatus';
import {ViewSwitcher} from './ViewSwitcher';

const TABS: {href: string; label: string}[] = [
  {href: '/models', label: "MODELS’"},
  {href: '/creators', label: "CREATORS’"},
  {href: '/generators', label: "GENERATORS’"},
  {href: '/influencers', label: "INFLUENCERS’"}
];

function isActiveTab(pathname: string, href: string) {
  if (href === '/models') return pathname === '/models' || pathname.startsWith('/models/');
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TopHeader() {
  const pathname = usePathname();
  const showViewSwitcher = pathname === '/models';

  return (
    <header className="border-b ui-line">
      <div className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="flex items-center gap-3">
          <div aria-hidden className="h-5 w-5 bg-black" />
          <Link
            href="/models"
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
          {showViewSwitcher ? <ViewSwitcher /> : null}
          <SystemStatus />
        </div>
      </div>
    </header>
  );
}

