/**
 * Tailwind-классы для `/admin/models`.
 * Стили таблицы вынесены отдельно, чтобы серверная загрузка данных и действия оставались читаемыми.
 */
export const adminModelsPageClasses = {
  error:
    'border border-red-300 bg-red-50 p-4 font-doc text-[11px] uppercase tracking-[0.16em] text-red-900',
  root: 'space-y-10',
  header: 'flex flex-col gap-3 md:flex-row md:items-end md:justify-between',
  title:
    'font-condensed text-[clamp(32px,4vw,52px)] leading-[0.9] uppercase tracking-[0.14em]',
  createLink: 'ui-btn-primary',
  tableWrap:
    'overflow-x-auto overflow-y-hidden border border-[color:var(--color-line)] bg-[var(--color-paper)]',
  tableInner: 'min-w-[980px]',
  tableHeaderRow:
    'grid grid-cols-[160px_1fr_160px_120px_120px_320px] items-center bg-black',
  headerCell:
    'border-r border-white/20 px-4 py-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-white',
  headerCellLast:
    'px-4 py-3 text-right font-condensed text-[12px] uppercase tracking-[0.18em] text-white',
  row:
    'grid grid-cols-[160px_1fr_160px_120px_120px_320px] items-center border-b border-[color:var(--color-line)] bg-[var(--color-surface)]',
  cellMuted:
    'border-r border-[color:var(--color-line)] px-4 py-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  cellTitleLink:
    'border-r border-[color:var(--color-line)] px-4 py-3 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink)] hover:underline',
  actions: 'flex justify-end gap-2 px-4 py-3',
  actionButton:
    'flex h-9 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]',
  actionEditLink:
    'flex h-9 items-center justify-center border border-black bg-black px-3 font-doc text-[11px] uppercase tracking-[0.18em] text-white hover:bg-[color-mix(in_oklab,#000,#fff_10%)]'
} as const;
