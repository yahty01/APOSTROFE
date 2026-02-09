/**
 * Tailwind-классы для `TopHeader`.
 * Держим стили отдельно, чтобы сама шапка читалась как "разметка", а не как набор className-строк.
 */
export const topHeaderClasses = {
  header: 'border-b ui-line',
  grid: 'grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto_1fr] md:items-center',
  brandWrap: 'flex items-center gap-3',
  mark: 'h-5 w-5 bg-black',
  brandLink: 'font-condensed text-sm uppercase tracking-[0.22em]',
  nav: 'flex flex-wrap items-center gap-2 md:justify-center',
  tab: 'ui-tab',
  tabActive: 'ui-tab--active',
  actions: 'flex flex-wrap items-center gap-2 md:justify-end'
} as const;
