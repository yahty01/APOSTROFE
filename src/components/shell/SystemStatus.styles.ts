/**
 * Tailwind-классы для `SystemStatus`.
 * Держим в отдельном файле, чтобы компонент оставался максимально простым.
 */
export const systemStatusClasses = {
  root:
    'flex h-10 flex-col justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-3 font-doc text-[10px] uppercase tracking-[0.18em] leading-tight text-[var(--color-ink)]'
} as const;
