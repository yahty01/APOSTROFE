/**
 * Tailwind-классы для `AdminHeader`.
 * Вынесено в отдельный файл, чтобы в компоненте оставалась логика и структура, а не стили.
 */
export const adminHeaderClasses = {
  header: 'border-b ui-line',
  grid: 'grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto_1fr] md:items-center',
  brandWrap: 'flex items-center gap-3',
  mark: 'h-5 w-5 bg-black',
  brandLink: 'font-condensed text-sm uppercase tracking-[0.22em]',
  nav: 'flex flex-wrap items-center gap-2 md:justify-center',
  tab: 'ui-tab',
  tabActive: 'ui-tab--active',
  actions: 'flex flex-wrap items-center gap-2 md:justify-end',
  signOutButton:
    'flex h-10 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]'
} as const;
