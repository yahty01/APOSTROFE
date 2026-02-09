/**
 * Общие Tailwind-классы для страниц-заглушек реестров (Creators/Generators/Influencers).
 * Файл лежит в сегменте `(public)`, чтобы переиспользовать стили между несколькими page.tsx.
 */
export const registryPageClasses = {
  root: 'space-y-12',
  header: 'space-y-4',
  title:
    'font-condensed text-[clamp(48px,6vw,72px)] leading-[0.88] uppercase tracking-[0.12em]',
  subtitle:
    'max-w-3xl font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  panel:
    'ui-panel p-10 text-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]'
} as const;
