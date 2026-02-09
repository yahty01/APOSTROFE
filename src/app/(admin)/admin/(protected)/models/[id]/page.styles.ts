/**
 * Tailwind-классы для страницы `/admin/models/[id]`.
 * Вынесено рядом, чтобы дизайн панели редактирования не мешал серверной логике загрузки данных.
 */
export const adminEditModelPageClasses = {
  root: 'space-y-10',
  header: 'flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
  headerMeta: 'space-y-1',
  title:
    'font-condensed text-[clamp(32px,4vw,52px)] leading-[0.9] uppercase tracking-[0.14em]',
  subtitle:
    'font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  panel: 'ui-panel p-6'
} as const;
