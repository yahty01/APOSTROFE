/**
 * Tailwind-классы для `MediaManager`.
 * Вынесены рядом, чтобы логика загрузки/удаления/перемещения медиа не смешивалась со стилями UI.
 */
export const mediaManagerClasses = {
  root: 'space-y-8',
  howPanel: 'ui-panel p-4',
  howTitle:
    'font-condensed text-[12px] uppercase tracking-[0.18em] text-[var(--color-ink)]',
  howList:
    'mt-3 space-y-1 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]',
  section: 'space-y-3',
  sectionHeader: 'flex items-start justify-between gap-4',
  sectionTitle: 'font-condensed text-xl uppercase tracking-[0.12em]',
  sectionHint:
    'mt-1 font-doc text-[10px] uppercase tracking-[0.16em] text-[var(--color-muted)]',
  uploadLabel:
    'flex h-10 cursor-pointer items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-4 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]',
  hiddenInput: 'hidden',
  catalogPreview:
    'relative aspect-[3/4] w-full max-w-[420px] overflow-hidden border border-[color:var(--color-line)] bg-[var(--color-paper)]',
  heroPreview:
    'relative aspect-square w-full max-w-[420px] overflow-hidden border border-[color:var(--color-line)] bg-[var(--color-paper)]',
  previewImage: 'object-contain object-center',
  previewFallback:
    'flex h-full w-full items-center justify-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  removeSingleButton:
    'flex h-9 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)] disabled:opacity-60',
  galleryGrid: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3',
  galleryItem: 'ui-panel p-3',
  galleryThumb:
    'relative aspect-[5/4] overflow-hidden border border-[color:var(--color-line)] bg-[var(--color-paper)]',
  galleryMetaRow: 'mt-3 flex items-center justify-between gap-2',
  galleryIndex:
    'truncate font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  galleryActions: 'flex gap-2',
  galleryButton:
    'flex h-8 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)] disabled:opacity-50',
  galleryEmpty:
    'ui-panel p-8 text-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]'
} as const;
