/**
 * Tailwind-классы для `ModelsToolbar`.
 * Вынесены рядом с компонентом, чтобы легче было поддерживать визуальную часть фильтров.
 */
export const modelsToolbarClasses = {
  root: 'flex items-center justify-between gap-4',
  label:
    'flex items-center gap-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  labelText: 'whitespace-nowrap',
  select: 'ui-select h-10 w-64 font-doc text-[11px] uppercase tracking-[0.18em]'
} as const;
