import {getTranslations} from 'next-intl/server';

import {LoginForm} from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations('admin.login');

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center">
      <div className="w-full rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-sm text-black/60">
          Use your Supabase Auth email/password.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
