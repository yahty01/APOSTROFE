/**
 * Tailwind-классы для `ViewSwitcher`.
 * Отделение стилей помогает менять UI-сегменты без редактирования логики работы с query/sessionStorage.
 */
export const viewSwitcherClasses = {
  root:
    'flex w-full items-center justify-between gap-4 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] md:w-auto md:justify-start',
  labelText: 'whitespace-nowrap',
  select:
    'ui-select ui-select--strong h-10 w-full font-doc text-[11px] uppercase tracking-[0.18em] md:w-56'
} as const;
