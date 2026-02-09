/**
 * Tailwind-классы для `ViewSwitcher`.
 * Отделение стилей помогает менять UI-сегменты без редактирования логики работы с query/sessionStorage.
 */
export const viewSwitcherClasses = {
  root:
    'inline-flex h-10 items-stretch gap-px border border-[color:var(--color-line)] bg-[var(--color-line)]',
  segmentBase:
    'flex h-10 items-center justify-center px-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]',
  segmentBg: 'bg-[var(--color-paper)]',
  segmentActive: 'bg-black text-white hover:bg-black'
} as const;
