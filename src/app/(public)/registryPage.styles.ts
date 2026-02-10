/**
 * Общие Tailwind-классы для страниц-заглушек реестров (Creators/Generators/Influencers).
 * Файл лежит в сегменте `(public)`, чтобы переиспользовать стили между несколькими page.tsx.
 */
export const registryPageClasses = {
  root: 'space-y-12',
  panel:
    'ui-panel p-6 text-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] md:p-10'
} as const;
