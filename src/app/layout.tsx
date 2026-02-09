import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';
import {Toaster} from 'sonner';

import './globals.css';

import {rootLayoutClasses} from './layout.styles';

/**
 * Подключаем шрифты через `next/font`, чтобы иметь CSS variables и корректную оптимизацию загрузки.
 * Используется в `body.className`.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rootLayoutClasses.body}`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
