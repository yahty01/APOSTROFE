/**
 * Tailwind-классы для `/admin/settings/marquee`.
 * Вынос стилей помогает держать server-side загрузку настроек максимально чистой.
 */
export const adminMarqueeSettingsPageClasses = {
  error:
    'border border-red-300 bg-red-50 p-4 font-doc text-[11px] uppercase tracking-[0.16em] text-red-900',
  root: 'space-y-6',
  title:
    'font-condensed text-[clamp(32px,4vw,52px)] leading-[0.9] uppercase tracking-[0.14em]',
  panel: 'ui-panel p-6'
} as const;
