/**
 * Tailwind-классы для `ViewSwitcher`.
 * Отделение стилей помогает менять UI-сегменты без редактирования логики работы с query/sessionStorage.
 */
export const viewSwitcherClasses = {
  root:
    'flex flex-col items-start gap-2 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] md:flex-row md:items-center md:gap-3',
  labelText: 'md:whitespace-nowrap',
  select: 'ui-select h-10 w-full font-doc text-[11px] uppercase tracking-[0.18em] md:w-44'
} as const;
