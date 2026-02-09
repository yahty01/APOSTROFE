/**
 * Tailwind-классы для `AdminProtectedLayout` (экран "access denied").
 * Отдельный файл нужен, чтобы auth/role логика не смешивалась со стилями.
 */
export const adminProtectedLayoutClasses = {
  deniedWrap: 'mx-auto max-w-2xl py-16',
  deniedPanel: 'ui-panel p-6',
  deniedTitle: 'font-condensed text-xl uppercase tracking-[0.12em]',
  deniedSubtitle:
    'mt-3 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]'
} as const;
