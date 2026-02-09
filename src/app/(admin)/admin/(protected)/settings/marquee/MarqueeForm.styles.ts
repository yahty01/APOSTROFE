/**
 * Tailwind-классы для `MarqueeForm`.
 * Вынесены рядом, чтобы в компоненте оставалась только логика формы и минимум UI-шумов.
 */
export const marqueeFormClasses = {
  form: 'space-y-6',
  checkboxLabel:
    'flex items-center gap-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  checkboxInput:
    'h-4 w-4 border border-[color:var(--color-line)] bg-[var(--color-paper)]',
  textGrid: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
  controlsGrid: 'grid grid-cols-1 gap-4 sm:grid-cols-2',
  label:
    'block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  textarea: 'ui-textarea mt-2 font-doc text-[11px] tracking-[0.06em]',
  speedInput: 'ui-input mt-2 h-11 font-doc text-[11px] tracking-[0.06em]',
  help:
    'mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  select:
    'ui-select mt-2 h-11 font-doc text-[11px] uppercase tracking-[0.18em]',
  submit: 'ui-btn-primary disabled:cursor-not-allowed disabled:opacity-60'
} as const;
