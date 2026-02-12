/**
 * Tailwind-классы для `PageHeading`.
 * Вынесены отдельно, чтобы компоненты-обёртки (public/admin) могли переиспользовать одну типографику.
 */
export const pageHeadingClasses = {
  root: 'space-y-3 md:space-y-4',
  title:
    'font-condensed text-[clamp(28px,5vw,64px)] font-bold leading-[0.88] uppercase tracking-[0.12em]',
  subtitle:
    'max-w-3xl font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]'
} as const;
