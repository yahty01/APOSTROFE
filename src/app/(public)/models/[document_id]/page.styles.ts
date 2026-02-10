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
  root: 'space-y-6',
  topRow: 'flex items-center justify-between gap-4',
  backLink:
    'font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-ink)]',
  contentWrap: '-mx-6 space-y-0',
  mainGrid: 'grid grid-cols-1 gap-px bg-[var(--color-line)] lg:grid-cols-2',
  mediaSection: 'bg-[var(--color-surface)] p-0',
  hero: 'relative aspect-[4/5] w-full bg-[var(--color-paper)]',
  heroImage: 'object-cover object-top',
  heroFallback:
    'flex h-full w-full items-center justify-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  gallerySection:
    'border-t border-[color:var(--color-line)] bg-[var(--color-paper)] px-6 py-8',
  galleryGrid:
    'mx-auto grid max-w-[1800px] grid-cols-1 items-start gap-4 sm:grid-cols-2',
  galleryItem: 'relative w-full overflow-hidden bg-[var(--color-paper)]',
  galleryItemVertical: 'aspect-[3/4]',
  galleryItemHorizontal: 'aspect-[4/3]',
  galleryItemSolo: 'sm:col-span-2',
  galleryImage: 'object-contain object-top',
  galleryFallback:
    'bg-[var(--color-paper)] p-6 text-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  detailsSection: 'bg-[var(--color-surface)] p-6',
  title:
    'font-condensed text-[clamp(32px,4vw,52px)] leading-[0.9] uppercase tracking-[0.14em]',
  meta:
    'mt-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  blocks:
    'mt-6 border-y border-[color:var(--color-line)] divide-y divide-[color:var(--color-line)]',
  block: 'py-5',
  blockTitle:
    'font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  blockText:
    'mt-2 max-w-[72ch] font-doc text-[11px] uppercase tracking-[0.14em] leading-[1.45]',
  blockBody: 'mt-3',
  blockPre:
    'overflow-auto bg-[var(--color-paper)] p-3 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]',
  actions: 'mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2',
  actionPrimary: 'ui-btn-primary w-full',
  actionSecondary: 'ui-btn-outline w-full'
} as const;
