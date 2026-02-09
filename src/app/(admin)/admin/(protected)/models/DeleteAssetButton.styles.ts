/**
 * Tailwind-классы для `DeleteAssetButton`.
 * Вынесены рядом, чтобы кнопку можно было быстро переоформить без изменений логики.
 */
export const deleteAssetButtonClasses = {
  button:
    'flex h-9 items-center justify-center border border-red-300 bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60'
} as const;
