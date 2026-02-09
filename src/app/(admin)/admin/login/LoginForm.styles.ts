/**
 * Tailwind-классы для `LoginForm`.
 * Стили вынесены в отдельный файл, чтобы форму было проще расширять без "портянок" className в JSX.
 */
export const loginFormClasses = {
  form: 'space-y-4',
  label:
    'block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  input: 'ui-input mt-2 h-11 font-doc text-[11px] uppercase tracking-[0.14em]',
  error:
    'border border-red-300 bg-red-50 p-3 font-doc text-[11px] uppercase tracking-[0.14em] text-red-900',
  submit: 'ui-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60'
} as const;
