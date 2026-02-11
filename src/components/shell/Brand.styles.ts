/**
 * Tailwind-классы для `Brand`.
 * Выносим отдельно, чтобы `TopHeader`/`AdminHeader` переиспользовали один бренд-блок без дублирования.
 */
export const brandClasses = {
  root: 'inline-flex items-center gap-3 text-black select-none',
  mark: 'h-5 w-5 shrink-0 md:h-6 md:w-6',
  label:
    'font-condensed font-bold text-[18px] leading-none uppercase tracking-[-0.02em] whitespace-nowrap md:text-[30px] md:leading-[24px]'
} as const;

