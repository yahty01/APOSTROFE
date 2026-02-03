'use client';

import {useActionState} from 'react';
import {useTranslations} from 'next-intl';

import {loginAction, type LoginActionState} from './actions';

const initialState: LoginActionState = {error: null};

export function LoginForm() {
  const t = useTranslations('admin.login');

  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black/80">
          {t('email')}
        </label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-black/80">
          {t('password')}
        </label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
        />
      </div>

      {state.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}

