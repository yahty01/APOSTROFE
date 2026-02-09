import type {CSSProperties} from 'react';

/**
 * Tailwind-классы и styling-хелперы для `AssetsTable`.
 * Вынесены отдельно, чтобы таблица оставалась читабельной (особенно с виртуализацией).
 */
export const assetsTableClasses = {
  gridCols: 'grid-cols-[180px_140px_160px_140px_1fr]',
  root: 'border border-[color:var(--color-line)] bg-[var(--color-paper)]',
  headerRow:
    'grid items-center border-b border-[color:var(--color-line)] bg-black',
  headerCell:
    'border-r border-white/20 px-4 py-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-white',
  headerCellLast:
    'px-4 py-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-white',
  scrollArea: 'max-h-[70vh] overflow-auto',
  virtualContainer: 'relative',
  rowBase:
    'absolute left-0 top-0 w-full border-b border-[color:var(--color-line)]',
  rowSelected: 'bg-black text-white',
  rowDefault:
    'bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-surface),#000_6%)]',
  rowGrid: 'grid items-center',
  cellBase:
    'border-r px-4 py-3 font-doc text-[11px] uppercase tracking-[0.18em]',
  cellBorderSelected: 'border-white/20',
  cellBorderDefault: 'border-[color:var(--color-line)]',
  cellLink: 'hover:underline',
  descCell: 'px-4 py-3 font-doc text-[11px] uppercase tracking-[0.14em]'
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
