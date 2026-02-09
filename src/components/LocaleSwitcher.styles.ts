/**
 * Tailwind-классы для `LocaleSwitcher`.
 * Стили вынесены отдельно, чтобы компонент оставался читаемым и легко заменяемым.
 */
export const localeSwitcherClasses = {
  root:
    'inline-flex items-center gap-1 rounded-full border border-black/10 bg-white p-1 text-xs',
  linkBase: 'rounded-full px-2 py-1',
  linkActive: 'bg-black text-white',
  linkInactive: 'text-black/70 hover:text-black'
} as const;
