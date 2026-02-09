/**
 * Tailwind-классы для `NewModelClient`.
 * Вынесены рядом, чтобы экран pre-upload выглядел аккуратно без длинных className-строк в JSX.
 */
export const newModelClientClasses = {
  root: 'space-y-6',
  panel: 'ui-panel p-6',
  panelHeaderRow: 'flex items-start justify-between gap-4',
  panelTitle: 'font-condensed text-xl uppercase tracking-[0.12em]',
  panelSubtitle:
    'mt-2 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]',
  clearButton:
    'flex h-9 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]',
  inputsGrid: 'mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2',
  field: 'space-y-2',
  fieldLabel:
    'font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  fileLabel:
    'flex h-10 cursor-pointer items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-4 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]',
  fileInputHidden: 'hidden',
  fileInfo: 'font-doc text-[11px] tracking-[0.06em] text-[var(--color-muted)]',
  fileInfoList: 'space-y-1',
  fileName: 'truncate',
  warn: 'text-amber-700',
  note:
    'mt-4 font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]'
} as const;
