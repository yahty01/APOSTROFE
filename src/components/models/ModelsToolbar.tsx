'use client';

import {useEffect} from 'react';
import {useTranslations} from 'next-intl';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';

type ViewMode = 'cards' | 'list';

function asViewMode(value: string | null): ViewMode | null {
  if (value === 'cards' || value === 'list') return value;
  return null;
}

export function ModelsToolbar({categories}: {categories: string[]}) {
  const t = useTranslations('public');
  const tCommon = useTranslations('common');

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const view = asViewMode(searchParams.get('view')) ?? 'cards';
  const category = searchParams.get('category') ?? 'all';

  useEffect(() => {
    if (searchParams.get('view')) return;
    const stored = asViewMode(sessionStorage.getItem('models_view'));
    if (!stored) return;
    const next = new URLSearchParams(searchParams.toString());
    next.set('view', stored);
    router.replace(`${pathname}?${next.toString()}`);
  }, [pathname, router, searchParams]);

  function setView(nextView: ViewMode) {
    sessionStorage.setItem('models_view', nextView);
    const next = new URLSearchParams(searchParams.toString());
    next.set('view', nextView);
    router.push(`${pathname}?${next.toString()}`);
  }

  function setCategory(nextCategory: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete('page');
    if (!nextCategory || nextCategory === 'all') next.delete('category');
    else next.set('category', nextCategory);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="inline-flex w-fit items-center gap-1 rounded-full border border-black/10 bg-white p-1">
        <button
          type="button"
          onClick={() => setView('cards')}
          className={`rounded-full px-3 py-1.5 text-sm ${
            view === 'cards'
              ? 'bg-black text-white'
              : 'text-black/70 hover:text-black'
          }`}
        >
          {t('view.cards')}
        </button>
        <button
          type="button"
          onClick={() => setView('list')}
          className={`rounded-full px-3 py-1.5 text-sm ${
            view === 'list'
              ? 'bg-black text-white'
              : 'text-black/70 hover:text-black'
          }`}
        >
          {t('view.list')}
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-black/70">
        <span className="whitespace-nowrap">{t('category')}</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 w-full rounded-md border border-black/10 bg-white px-3 text-sm text-black shadow-sm outline-none focus:ring-2 focus:ring-black/10 sm:w-60"
        >
          <option value="all">{tCommon('all')}</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

