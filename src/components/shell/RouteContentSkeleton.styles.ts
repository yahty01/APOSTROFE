/**
 * Tailwind-классы для `RouteContentSkeleton`.
 * Это универсальный "скелет" под заголовком страницы на время навигации/подгрузки данных.
 */
export const routeContentSkeletonClasses = {
  root: 'space-y-12',
  toolbarGrid:
    'grid grid-cols-1 gap-px bg-[var(--color-line)] md:grid-cols-[1fr_auto]',
  panel: 'bg-[var(--color-surface)] p-4',
  blocks: 'space-y-2',
  boxBase:
    'rounded-sm bg-[color-mix(in_oklab,var(--color-line),#fff_35%)] motion-safe:animate-[loading-bar-pulse_1.2s_ease-in-out_infinite] motion-reduce:opacity-60',
  grid: 'grid grid-cols-1 gap-px bg-[var(--color-line)] md:grid-cols-3',
  card: 'bg-[var(--color-surface)] p-6',
  media: 'aspect-[4/3] w-full',
  meta: 'mt-4 space-y-2',
  paginationWrap:
    'flex flex-col gap-3 border-t ui-line pt-6 md:flex-row md:items-center md:justify-between',
  paginationButtons: 'flex flex-wrap gap-2'
} as const;

