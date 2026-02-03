import {NextRequest, NextResponse} from 'next/server';

function safeRedirectPath(value: string | null): string {
  if (!value) return '/';
  if (!value.startsWith('/')) return '/';
  return value;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const locale = url.searchParams.get('locale');
  const redirectTo = safeRedirectPath(url.searchParams.get('redirect'));

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  if (locale === 'ru' || locale === 'en') {
    response.cookies.set('locale', locale, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365
    });
  }

  return response;
}

