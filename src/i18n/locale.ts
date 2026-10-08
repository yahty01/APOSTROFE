export const SUPPORTED_LOCALES = ['ru', 'en'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export function isSupportedLocale(value: string | undefined): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}
export function detectLocaleFromAcceptLanguage(value: string | null): AppLocale {
  const preferences = (value ?? '').split(',').map((part, index) => {
    const [tag, ...params] = part.trim().toLowerCase().split(';');
    const q = params.find((param) => param.trim().startsWith('q='));
    return {locale: tag.split('-')[0], quality: q ? Number(q.trim().slice(2)) : 1, index};
  }).filter((item) => isSupportedLocale(item.locale) && Number.isFinite(item.quality) && item.quality > 0 && item.quality <= 1)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);
  return (preferences[0]?.locale as AppLocale) ?? 'ru';
}
