import {NextRequest, NextResponse} from 'next/server';

/**
 * Санитизирует путь редиректа, чтобы не допустить open-redirect на внешние домены.
 * Разрешаем только относительные пути, начинающиеся с `/`.
 */
function safeRedirectPath(value: string | null): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return '/';
  if (!trimmed.startsWith('/')) return '/';
  // Запрещаем protocol-relative URL (`//evil.com`) и любые backslash/CRLF-инъекции.
  if (trimmed.startsWith('//')) return '/';
  if (trimmed.includes('\\')) return '/';
  if (trimmed.includes('\n') || trimmed.includes('\r')) return '/';
  return trimmed;
}

/**
 * Устанавливает cookie `locale` и редиректит обратно на исходную страницу.
 * Используется UI-переключателями языка (`LanguageDropdown`, `LocaleSwitcher`).
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale');
  const redirectTo = safeRedirectPath(url.searchParams.get('redirect'));

  const isLocaleSwitch =
    request.headers.get('x-locale-switch') === '1';

  const response = isLocaleSwitch
    ? new NextResponse(null, {status: 204})
    : NextResponse.redirect(new URL(redirectTo, request.url));

  response.headers.set('Cache-Control', 'no-store');

  if (locale === 'ru' || locale === 'en') {
    response.cookies.set('locale', locale, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      secure: process.env.NODE_ENV === 'production'
    });
  }

  return response;
}
