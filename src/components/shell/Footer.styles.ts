/**
 * Tailwind-классы для `Footer`.
 * Вынесено в отдельный файл для удобства дальнейшей доработки футера без засорения JSX.
 */
export const footerClasses = {
  footer: "border-t ui-line",
  topGrid: "grid grid-cols-2 gap-px bg-[var(--color-line)] md:grid-cols-3",
  topPanel: "bg-[var(--color-paper)] p-4 md:p-6",
  metaPanel: "bg-[var(--color-paper)] p-4 md:col-span-3 md:px-6 md:py-4",
  topTitle: "font-condensed text-[11px] uppercase tracking-[0.18em] md:text-xs",
  topList:
    "mt-3 space-y-1 font-doc text-[10px] uppercase text-[var(--color-muted)] md:text-[11px]",
  topLink: "block hover:text-[var(--color-ink)]",
  metaStack:
    "space-y-2 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0",
  bottomText:
    "font-doc text-[10px] uppercase text-[var(--color-muted)] md:flex-1 md:text-[11px] md:whitespace-nowrap",
  bottomTextCenter:
    "font-doc text-[10px] uppercase text-[var(--color-muted)] md:flex-1 md:text-center md:text-[11px] md:whitespace-nowrap",
  bottomTextRight:
    "font-doc text-[10px] uppercase text-[var(--color-muted)] md:flex-1 md:text-right md:text-[11px] md:whitespace-nowrap",
  bottomLink: "inline-block hover:text-[var(--color-ink)]",
} as const;
