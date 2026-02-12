import type {Metadata} from 'next';
import {IBM_Plex_Mono, Tiny5} from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import {Toaster} from 'sonner';

import './globals.css';

import {rootLayoutClasses} from './layout.styles';

/**
 * Подключаем шрифты через `next/font`, чтобы иметь CSS variables и корректную оптимизацию загрузки.
 * Используется в `html.className`.
 */
const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700']
});

const tiny5 = Tiny5({
  variable: '--font-tiny5',
  subsets: ['latin', 'cyrillic'],
  weight: '400'
});

export const metadata: Metadata = {
  title: "Apostrofe",
  description: "Models catalog + admin",
};

/**
 * Root layout всего приложения.
 * Подключает global CSS, next-intl провайдер, шрифты и Toaster для уведомлений.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${ibmPlexMono.variable} ${tiny5.variable} ${ibmPlexMono.className}`}
    >
      <body
        className={rootLayoutClasses.body}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
