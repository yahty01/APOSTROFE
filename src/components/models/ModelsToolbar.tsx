'use client';

import {useTranslations} from 'next-intl';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useTransition} from 'react';

import {useReportPending} from '@/lib/pending';

import {modelsToolbarClasses} from './ModelsToolbar.styles';

/**
 * Панель фильтрации реестра по одному текстовому параметру.
 * Используется на публичных страницах `/models`, `/creators`, `/influencers`.
 */
export function ModelsToolbar({
  categories,
  label,
  paramName = 'category'
}: {
  categories: string[];
  label: string;
  paramName?: string;
}) {
  const tCommon = useTranslations('common');

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  useReportPending(isPending);

  const category = searchParams.get(paramName) ?? 'all';

  /**
   * Обновляет query string так, чтобы выбор категории был ссылочным состоянием (делится URL).
   * При смене категории сбрасываем `page`, чтобы пагинация начиналась с первой страницы.
   */
  function setCategory(nextCategory: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.delete('page');
    if (!nextCategory || nextCategory === 'all') next.delete(paramName);
    else next.set(paramName, nextCategory);
    startTransition(() => {
      router.push(`${pathname}?${next.toString()}`);
    });
  }

  return (
    <div className={modelsToolbarClasses.root}>
      <label className={modelsToolbarClasses.label}>
        <span className={modelsToolbarClasses.labelText}>{label}</span>
        <select
          value={category}
          disabled={isPending}
          onChange={(e) => setCategory(e.target.value)}
          className={modelsToolbarClasses.select}
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
