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
        <label className="block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {t('email')}
        </label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="ui-input mt-2 h-11 font-doc text-[11px] uppercase tracking-[0.14em]"
        />
      </div>

      <div>
        <label className="block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {t('password')}
        </label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="ui-input mt-2 h-11 font-doc text-[11px] uppercase tracking-[0.14em]"
        />
      </div>

      {state.error ? (
        <div className="border border-red-300 bg-red-50 p-3 font-doc text-[11px] uppercase tracking-[0.14em] text-red-900">
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="ui-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
