import {cookies, headers} from 'next/headers';
import {getRequestConfig} from 'next-intl/server';

const SUPPORTED_LOCALES = ['ru', 'en'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

function isSupportedLocale(value: string | undefined): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

function detectLocaleFromAcceptLanguage(value: string | null): AppLocale {
  const lower = (value ?? '').toLowerCase();
  if (lower.includes('ru')) return 'ru';
  return 'en';
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('locale')?.value;

  const locale: AppLocale = isSupportedLocale(cookieLocale)
    ? cookieLocale
    : detectLocaleFromAcceptLanguage((await headers()).get('accept-language'));

  const messages =
    locale === 'ru'
      ? (await import('../messages/ru.json')).default
      : (await import('../messages/en.json')).default;

  return {locale, messages};
});

