/**
 * Tailwind-классы для `TopHeader`.
 * Держим стили отдельно, чтобы сама шапка читалась как "разметка", а не как набор className-строк.
 */
export const topHeaderClasses = {
  header: 'border-b ui-line',
  grid: 'grid grid-flow-row-dense grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 md:grid-cols-[1fr_auto_1fr]',
  brandWrap: 'flex items-center gap-3',
  mark: 'h-5 w-5 bg-black',
  brandLink: 'font-condensed text-sm uppercase tracking-[0.22em]',
  nav: 'col-span-2 -mx-4 flex flex-nowrap items-center gap-2 overflow-x-auto px-4 pb-1 md:col-span-1 md:mx-0 md:justify-center md:px-0 md:pb-0 lg:overflow-visible',
  tab: 'ui-tab',
  tabActive: 'ui-tab--active',
  actions: 'flex flex-wrap items-center justify-end gap-2'
} as const;
