/**
 * Tailwind-классы для страницы `/models`.
 * Вынесены рядом со страницей, чтобы логика загрузки данных не смешивалась со стилями.
 */
export const modelsPageClasses = {
  root: 'space-y-12',
  header: 'space-y-4',
  title:
    'font-condensed text-[clamp(48px,6vw,72px)] leading-[0.88] uppercase tracking-[0.12em]',
  subtitle:
    'max-w-3xl font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  toolbarGrid:
    'grid grid-cols-1 gap-px bg-[var(--color-line)] md:grid-cols-[1fr_auto]',
  statsPanel:
    'bg-[var(--color-surface)] p-4 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  statsPageRow: 'mt-1',
  toolbarPanel: 'bg-[var(--color-surface)] p-4',
  errorPanel:
    'ui-panel p-4 font-doc text-[11px] uppercase tracking-[0.16em] text-red-800',
  emptyPanel:
    'ui-panel p-10 text-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  paginationWrap:
    'flex flex-col gap-3 border-t ui-line pt-6 md:flex-row md:items-center md:justify-between',
  paginationLabel:
    'font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  paginationButtons: 'flex flex-wrap gap-2',
  pageButtonBase:
    'flex h-10 items-center justify-center border px-4 font-doc text-[11px] uppercase tracking-[0.18em]',
  pageButtonEnabled:
    'border-[color:var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]',
  pageButtonDisabled:
    'cursor-not-allowed border-[color:var(--color-line)] bg-[color-mix(in_oklab,var(--color-paper),#000_6%)] text-[var(--color-muted)] opacity-60',
  allButton:
    'hidden h-10 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-4 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)] md:flex',
  ctaWrap: 'py-16',
  ctaInner: 'flex justify-center',
  ctaButton: 'ui-btn-primary h-14 px-10 text-[16px]'
} as const;
