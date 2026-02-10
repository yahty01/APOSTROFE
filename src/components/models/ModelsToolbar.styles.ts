/**
 * Tailwind-классы для `ModelsToolbar`.
 * Вынесены рядом с компонентом, чтобы легче было поддерживать визуальную часть фильтров.
 */
export const modelsToolbarClasses = {
  root: 'w-full',
  label:
    'flex w-full flex-col gap-2 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] md:flex-row md:items-center md:gap-3',
  labelText: 'md:whitespace-nowrap',
  select:
    'ui-select h-10 w-full font-doc text-[11px] uppercase tracking-[0.18em] md:w-64'
} as const;
