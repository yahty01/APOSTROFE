import type {CSSProperties} from 'react';

/**
 * Tailwind-классы и styling-хелперы для `AssetsTable`.
 * Вынесены отдельно, чтобы таблица оставалась читабельной (особенно с виртуализацией).
 */
export const assetsTableClasses = {
  gridCols:
    'grid-cols-[140px_110px_120px_110px_1fr] lg:grid-cols-[180px_140px_160px_140px_1fr]',
  root: 'border border-[color:var(--color-line)] bg-[var(--color-paper)]',
  headerRow:
    'grid items-center border-b border-[color:var(--color-line)] bg-black',
  headerCell:
    'border-r border-white/20 px-3 py-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-white lg:px-4',
  headerCellLast:
    'px-3 py-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-white lg:px-4',
  scrollArea: 'max-h-[70vh] overflow-auto',
  virtualContainer: 'relative',
  rowBase:
    'absolute left-0 top-0 w-full border-b border-[color:var(--color-line)]',
  rowSelected: 'bg-black text-white',
  rowDefault:
    'bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-surface),#000_6%)]',
  rowGrid: 'grid items-center',
  cellBase:
    'border-r px-3 py-3 font-doc text-[11px] uppercase tracking-[0.18em] lg:px-4',
  cellBorderSelected: 'border-white/20',
  cellBorderDefault: 'border-[color:var(--color-line)]',
  cellLink: 'hover:underline',
  descCell: 'px-3 py-3 font-doc text-[11px] uppercase tracking-[0.14em] lg:px-4',

  // Mobile stacked list (phone)
  mobileList: 'grid gap-px bg-[var(--color-line)] md:hidden',
  mobileItem: 'bg-[var(--color-surface)] p-4',
  mobileTopRow: 'flex items-start justify-between gap-4',
  mobileDocLink:
    'min-w-0 truncate font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] hover:underline',
  mobileTimestamp:
    'shrink-0 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  mobileMetaGrid: 'mt-3 grid grid-cols-2 gap-3',
  mobileMetaLabel:
    'font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  mobileMetaValue:
    'mt-1 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink)]',
  mobileDesc:
    'mt-3 line-clamp-3 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]'
} as const;

/**
 * Возвращает inline-style для контейнера виртуализированных строк.
 * Используется в `AssetsTable`, чтобы задать общую высоту скролл-области.
 */
export function getVirtualizerContainerStyle(totalSizePx: number): CSSProperties {
  return {height: `${totalSizePx}px`};
}

/**
 * Возвращает inline-style для позиционирования строки по Y (translateY).
 * Используется в `AssetsTable` при рендере каждого virtual item.
 */
export function getVirtualRowStyle(offsetPx: number): CSSProperties {
  return {transform: `translateY(${offsetPx}px)`};
}
