import {cookies, headers} from 'next/headers';
import {getRequestConfig} from 'next-intl/server';

import {detectLocaleFromAcceptLanguage, isSupportedLocale, type AppLocale} from './locale';
export type {AppLocale} from './locale';

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
