/**
 * Tailwind-классы для страницы `/admin/login`.
 * Вынесены рядом с page, чтобы UI-обвязка не смешивалась с загрузкой данных из Supabase.
 */
export const adminLoginPageClasses = {
  root: 'mx-auto flex min-h-[70vh] max-w-md items-center',
  panel: 'ui-panel w-full p-6',
  title: 'font-condensed text-xl uppercase tracking-[0.12em]',
  subtitle:
    'mt-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]',
  form: 'mt-6'
} as const;
