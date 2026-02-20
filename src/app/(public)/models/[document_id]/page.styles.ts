/**
 * Tailwind-классы для страницы `/models/[document_id]`.
 * Также переиспользуются в публичных detail-страницах `creators` и `influencers`.
 * Вынесены рядом со страницей, чтобы разметка оставалась читаемой, а стили редактировались отдельно.
 */
export const modelDetailPageClasses = {
  kvGrid: "grid grid-cols-1 gap-px bg-[var(--color-line)] sm:grid-cols-2",
  kvItem: "bg-[var(--color-paper)] px-3 py-2",
  kvKey:
    "font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]",
  kvValue:
    "mt-1 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink)]",
  root: "space-y-4",
  topRow: "flex items-center justify-between gap-4",
  backLink:
    "font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-ink)]",
  contentWrap: "mx-auto max-w-[1540px] space-y-0",
  mainGrid:
    "grid grid-cols-1 gap-px border border-[color:var(--color-line)] bg-[var(--color-line)] lg:[--detail-media-size:min(40vw,616px)] lg:grid-cols-[var(--detail-media-size)_minmax(0,1fr)] lg:grid-rows-[var(--detail-media-size)]",
  mediaSection: "bg-[var(--color-surface)] p-0 lg:h-full",
  hero: "relative aspect-square w-full overflow-hidden bg-[var(--color-paper)] lg:h-full",
  heroImage: "object-cover object-center",
  heroFallback:
    "flex h-full w-full items-center justify-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]",
  gallerySection:
    "border-x border-b border-[color:var(--color-line)] bg-[var(--color-paper)] px-4 py-6 md:px-6 md:py-8",
  galleryGrid:
    "mx-auto grid max-w-[1800px] grid-cols-1 items-start gap-4 sm:grid-cols-2",
  galleryItem:
    "relative aspect-[5/4] w-full overflow-hidden bg-[var(--color-paper)]",
  galleryItemSolo:
    "sm:col-span-2 sm:w-full sm:max-w-[1200px] sm:justify-self-center",
  galleryImage: "object-contain object-center",
  galleryFallback:
    "bg-[var(--color-paper)] p-6 text-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]",
  detailsSection:
    "flex flex-col bg-[var(--color-surface)] px-1 py-7 md:px-8 md:py-10 lg:grid lg:h-full lg:grid-rows-[auto_auto_minmax(0,1fr)_auto] lg:overflow-hidden lg:px-6 lg:py-6 xl:px-8 xl:py-8",
  title:
    "max-w-[30ch] font-condensed text-[clamp(38px,4.6vw,72px)] leading-[0.88] uppercase tracking-[0.18em] [overflow-wrap:anywhere] lg:text-[clamp(30px,3.4vw,56px)]",
  meta: "mt-5 font-doc text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)] lg:mt-3 lg:text-[10px]",
  blocks:
    "mt-8 grid grid-cols-1 gap-y-px border-y border-[color:var(--color-line)] bg-[var(--color-line)] lg:mt-4 lg:min-h-0 lg:grid-cols-2 lg:overflow-x-hidden lg:overflow-y-auto lg:[-ms-overflow-style:none] lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:w-0 lg:hover:[scrollbar-width:thin] lg:hover:[&::-webkit-scrollbar]:w-1.5 lg:hover:[&::-webkit-scrollbar-thumb]:bg-[var(--color-line)] lg:[&>*:first-child]:col-span-2 lg:[&>*:last-child:nth-child(even)]:col-span-2",
  block: "bg-[var(--color-surface)] py-7 lg:py-4",
  blockTitle:
    "font-doc text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted)] lg:text-[10px]",
  blockText:
    "mt-3 max-w-[68ch] font-doc text-[12px] uppercase tracking-[0.15em] leading-[1.7] lg:mt-2 lg:text-[11px] lg:leading-[1.45] lg:[display:-webkit-box] lg:[-webkit-box-orient:vertical] lg:[-webkit-line-clamp:8] lg:overflow-hidden",
  socialLinksList: "mt-3 flex flex-wrap items-center gap-2 lg:mt-2",
  socialIconAnchor:
    "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[color:var(--color-line)] text-[var(--color-muted)] transition-colors hover:cursor-pointer hover:border-[color:var(--color-ink)] hover:text-[var(--color-ink)] active:border-[color:var(--color-ink)] active:bg-[var(--color-ink)] active:text-[var(--color-paper)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)] lg:h-8 lg:w-8",
  socialIconAnchorStatic:
    "hover:text-[var(--color-muted)] active:bg-transparent",
  socialIconGlyph: "h-5 w-5 cursor-pointer bg-current lg:h-4 lg:w-4",
  socialIconImage: "h-5 w-5 select-none object-contain lg:h-4 lg:w-4",
  blockBody: "mt-4 lg:mt-2",
  blockPre:
    "overflow-hidden bg-[var(--color-paper)] p-3 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)] whitespace-pre-wrap break-words lg:text-[10px] lg:leading-[1.45]",
  actions: "mt-8 grid grid-cols-2 gap-3 max-[454px]:grid-cols-1 lg:mt-4 lg:gap-2",
  actionPrimary:
    "flex h-14 w-full items-center justify-center border border-black bg-black px-4 font-doc text-[12px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-[color-mix(in_oklab,#000,#fff_8%)] lg:h-12 lg:text-[11px] lg:tracking-[0.16em]",
  actionSecondary:
    "flex h-14 w-full items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-surface)] px-4 font-doc text-[12px] uppercase tracking-[0.2em] text-[var(--color-ink)] transition-colors hover:bg-[color-mix(in_oklab,var(--color-surface),#000_6%)] lg:h-12 lg:text-[11px] lg:tracking-[0.16em]",
} as const;
