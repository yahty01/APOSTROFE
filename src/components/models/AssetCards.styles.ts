/**
 * Tailwind-классы для `AssetCards`.
 * Стили вынесены рядом с компонентом, чтобы в JSX оставалась только структура карточек.
 */
export const assetCardsClasses = {
  root: 'border border-[color:var(--color-line)] bg-[var(--color-line)] p-px',
  grid:
    'grid grid-cols-1 gap-px bg-[var(--color-line)] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  card: 'group flex flex-col bg-[var(--color-surface)]',
  mediaLink: 'relative aspect-[4/5] w-full bg-[var(--color-paper)]',
  mediaImage: 'object-cover object-top',
  mediaFallback:
    'flex h-full w-full items-center justify-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  body: 'mt-px flex flex-1 flex-col gap-px bg-[var(--color-line)]',
  table:
    'flex-1 divide-y divide-[color:var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] group-hover:divide-white/30 group-hover:bg-black group-hover:text-white',
  row: 'flex items-start justify-between gap-4 px-3 py-2 font-doc text-[10px] uppercase tracking-[0.18em]',
  rowKey: 'text-[var(--color-muted)] group-hover:text-white/70',
  rowValue: 'text-right',
  description: 'px-3 py-2',
  descriptionLabel:
    'font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)] group-hover:text-white/70',
  descriptionValue: 'mt-1 line-clamp-4 font-doc text-[11px] uppercase tracking-[0.14em]',
  cta: 'ui-btn-primary w-full'
} as const;
