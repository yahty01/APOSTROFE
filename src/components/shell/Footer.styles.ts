/**
 * Tailwind-классы для `Footer`.
 * Вынесено в отдельный файл для удобства дальнейшей доработки футера без засорения JSX.
 */
export const footerClasses = {
  footer: 'border-t ui-line',
  topGrid: 'grid grid-cols-1 gap-px bg-[var(--color-line)] md:grid-cols-3',
  topPanel: 'bg-[var(--color-paper)] p-4 md:p-6',
  topTitle: 'font-condensed text-xs uppercase tracking-[0.18em]',
  topList: 'mt-3 space-y-1 font-doc text-[11px] uppercase text-[var(--color-muted)]',
  topLink: 'block hover:text-[var(--color-ink)]',
  bottomGrid:
    'grid grid-cols-1 gap-2 border-t ui-line bg-[var(--color-paper)] px-4 py-4 md:grid-cols-3 md:items-center md:px-6',
  bottomText: 'font-doc text-[11px] uppercase text-[var(--color-muted)]',
  bottomTextCenter:
    'text-left font-doc text-[11px] uppercase text-[var(--color-muted)] md:text-center',
  bottomTextRight:
    'text-left font-doc text-[11px] uppercase text-[var(--color-muted)] md:text-right',
  bottomLink: 'inline-block hover:text-[var(--color-ink)]'
} as const;
