/**
 * Tailwind-классы для страницы `/models/[document_id]`.
 * Вынесены рядом со страницей, чтобы разметка оставалась читаемой, а стили редактировались отдельно.
 */
export const modelDetailPageClasses = {
  kvGrid: 'grid grid-cols-1 gap-px bg-[var(--color-line)] sm:grid-cols-2',
  kvItem: 'bg-[var(--color-paper)] px-3 py-2',
  kvKey:
    'font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  kvValue:
    'mt-1 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink)]',
  root: 'space-y-10',
  topRow: 'flex items-center justify-between gap-4',
  backLink:
    'font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-ink)]',
  mainGrid: 'grid grid-cols-1 gap-px bg-[var(--color-line)] lg:grid-cols-2',
  mediaSection: 'bg-[var(--color-surface)] p-4',
  hero: 'relative aspect-[4/5] w-full bg-[var(--color-paper)]',
  heroImage: 'object-cover object-top',
  heroFallback:
    'flex h-full w-full items-center justify-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  thumbsGrid:
    'mt-4 grid grid-cols-2 gap-px bg-[var(--color-line)] sm:grid-cols-4',
  thumb: 'relative aspect-square bg-[var(--color-paper)]',
  thumbImage: 'object-cover object-center',
  thumbsFallback:
    'col-span-full bg-[var(--color-paper)] p-4 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  detailsSection: 'bg-[var(--color-surface)] p-6',
  title:
    'font-condensed text-[clamp(32px,4vw,52px)] leading-[0.9] uppercase tracking-[0.14em]',
  meta:
    'mt-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  blocks: 'mt-6 divide-y divide-[color:var(--color-line)]',
  block: 'py-5',
  blockTitle:
    'font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  blockText: 'mt-2 font-doc text-[11px] uppercase tracking-[0.14em]',
  blockBody: 'mt-3',
  blockPre:
    'overflow-auto bg-[var(--color-paper)] p-3 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]',
  actions: 'mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2',
  actionPrimary: 'ui-btn-primary w-full',
  actionSecondary: 'ui-btn-outline w-full'
} as const;
