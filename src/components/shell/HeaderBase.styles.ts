/**
 * База Tailwind-классов для публичной и админской шапок.
 * Вынесено отдельно, чтобы правки навигации/бренда применялись консистентно.
 */
export const headerBaseClasses = {
  header: 'border-b ui-line',
  grid: 'grid grid-flow-row-dense grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 md:grid-cols-[1fr_auto_1fr]',
  brandWrap: 'flex items-center gap-3',
  mark: 'h-6 w-auto shrink-0',
  brandLink: 'font-condensed text-sm uppercase tracking-[0.22em]',
  navBase:
    'col-span-2 -mx-4 flex flex-nowrap items-center gap-2 overflow-x-auto px-4 pb-1 md:col-span-1 md:mx-0 md:grid md:gap-2 md:overflow-visible md:px-0 md:pb-0',
  tab: 'ui-tab md:w-full',
  tabActive: 'ui-tab--active',
  actions: 'flex flex-wrap items-center justify-end gap-2',
  apostrophe: 'ml-[-0.15em]'
} as const;

