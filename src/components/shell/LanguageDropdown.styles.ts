/**
 * Tailwind-классы для `LanguageDropdown`.
 * Вынесено рядом с компонентом, чтобы не держать большие className-строки в JSX.
 */
export const languageDropdownClasses = {
  root: 'relative',
  summary:
    "flex h-10 cursor-pointer list-none appearance-none items-center gap-2 border border-[color:var(--color-line)] bg-[var(--color-surface)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-surface),#000_6%)] [&::-webkit-details-marker]:hidden [&::marker]:content-['']",
  caret: 'text-[10px]',
  flagWrap:
    'inline-flex aspect-[28/20] h-4 shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-white',
  flagImg: 'h-full w-full',
  menu:
    'absolute right-0 top-full z-30 mt-px w-28 border border-[color:var(--color-line)] bg-[var(--color-surface)]',
  menuInner: 'grid gap-px bg-[var(--color-line)] p-px',
  linkBase:
    'flex h-9 items-center justify-start gap-2 bg-[var(--color-surface)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-surface),#000_6%)]',
  linkActive: 'bg-black text-white hover:bg-black'
} as const;
