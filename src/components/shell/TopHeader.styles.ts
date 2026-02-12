/**
 * Tailwind-классы для `TopHeader`.
 * Держим стили отдельно, чтобы сама шапка читалась как "разметка", а не как набор className-строк.
 */
import {headerBaseClasses} from './HeaderBase.styles';

export const topHeaderClasses = {
  header: headerBaseClasses.header,
  grid: headerBaseClasses.grid,
  brandWrap: headerBaseClasses.brandWrap,
  mark: headerBaseClasses.mark,
  brandLink: headerBaseClasses.brandLink,
  nav: `${headerBaseClasses.navBase} md:grid-cols-4`,
  tab: headerBaseClasses.tab,
  tabActive: headerBaseClasses.tabActive,
  actions: headerBaseClasses.actions
} as const;
