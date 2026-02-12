/**
 * Tailwind-классы для `ModelsToolbar`.
 * Вынесены рядом с компонентом, чтобы легче было поддерживать визуальную часть фильтров.
 */
export const modelsToolbarClasses = {
  root: "w-full md:w-auto",
  label:
    "flex w-full items-center justify-between gap-4 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] md:w-auto md:justify-start",
  labelText: "whitespace-nowrap",
  select:
    "ui-select ui-select--strong h-10 w-full font-doc text-[11px] uppercase tracking-[0.18em] md:w-80",
} as const;
