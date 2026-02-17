/**
 * Tailwind-классы для `AdminHeader`.
 * Вынесено в отдельный файл, чтобы в компоненте оставалась логика и структура, а не стили.
 */
import {headerBaseClasses} from './HeaderBase.styles';

export const adminHeaderClasses = {
  header: headerBaseClasses.header,
  grid: headerBaseClasses.grid,
  brandWrap: headerBaseClasses.brandWrap,
  mark: headerBaseClasses.mark,
  brandLink: headerBaseClasses.brandLink,
  nav: `${headerBaseClasses.navBase} md:grid-cols-5`,
  tab: headerBaseClasses.tab,
  tabActive: headerBaseClasses.tabActive,
  actions: headerBaseClasses.actions,
  signOutButton:
    'flex h-10 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-surface)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-surface),#000_6%)]'
} as const;
