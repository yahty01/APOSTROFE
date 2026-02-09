import {cookies, headers} from 'next/headers';
import {getRequestConfig} from 'next-intl/server';

/**
 * Локали, которые поддерживает приложение.
 * Используется и как рантайм-список (валидация), и как источник для `AppLocale` (type-level).
 */
const SUPPORTED_LOCALES = ['ru', 'en'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Type guard для безопасного приведения строкового значения к `AppLocale`.
 * Используется при чтении cookie `locale`.
 */
function isSupportedLocale(value: string | undefined): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}

/**
 * Простая эвристика выбора локали из `Accept-Language`.
 * Нужна как fallback, когда cookie ещё не выставлена.
 */
function detectLocaleFromAcceptLanguage(value: string | null): AppLocale {
  const lower = (value ?? '').toLowerCase();
  if (lower.includes('ru')) return 'ru';
  return 'en';
}

/**
 * Конфигурация next-intl для App Router.
 * Подключается через `next-intl/plugin` в `next.config.ts` и подгружает сообщения по выбранной локали.
 */
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
