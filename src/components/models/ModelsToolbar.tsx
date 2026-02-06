'use client';

import {useTranslations} from 'next-intl';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';

export function ModelsToolbar({categories}: {categories: string[]}) {
  const t = useTranslations('public');
  const tCommon = useTranslations('common');

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const category = searchParams.get('category') ?? 'all';

  function setCategory(nextCategory: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete('page');
    if (!nextCategory || nextCategory === 'all') next.delete('category');
    else next.set('category', nextCategory);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex items-center justify-between gap-4">
      <label className="flex items-center gap-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
        <span className="whitespace-nowrap">{t('category')}</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="ui-select h-10 w-64 font-doc text-[11px] uppercase tracking-[0.18em]"
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
