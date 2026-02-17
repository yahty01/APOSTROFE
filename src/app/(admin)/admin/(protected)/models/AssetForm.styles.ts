/**
 * Tailwind-классы для `AssetForm`.
 * Вынесены рядом, чтобы правки UI формы не смешивались с валидацией и submit-логикой.
 */
export const assetFormClasses = {
  form: 'space-y-6',
  grid2: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
  label:
    'block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  input: 'ui-input mt-2 h-11 font-doc text-[11px] tracking-[0.14em]',
  readonlyValue:
    'ui-input mt-2 flex min-h-11 items-center bg-[color-mix(in_oklab,var(--color-paper),#000_3%)] font-doc text-[11px] tracking-[0.14em] text-[var(--color-muted)]',
  help:
    'mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  error: 'mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-red-700',
  checkboxWrap: 'pt-8',
  checkboxLabel:
    'flex items-center gap-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  checkboxInput:
    'h-4 w-4 border border-[color:var(--color-line)] bg-[var(--color-paper)]',
  textarea: 'ui-textarea mt-2 font-doc text-[11px] tracking-[0.14em]',
  jsonGrid: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
  submit: 'ui-btn-primary disabled:cursor-not-allowed disabled:opacity-60'
} as const;
