'use client';

import {useActionState} from 'react';
import {useTranslations} from 'next-intl';

import {useReportPending} from '@/lib/pending';

import {loginAction, type LoginActionState} from './actions';
import {loginFormClasses} from './LoginForm.styles';

/**
 * Начальное состояние формы для `useActionState`.
 * Храним ошибку отдельно, чтобы форма могла рендериться полностью на клиенте.
 */
const initialState: LoginActionState = {error: null};

/**
 * Клиентская форма логина админки.
 * Вызывает server action `loginAction` и отображает ошибку/состояние загрузки.
 */
export function LoginForm() {
  const t = useTranslations('admin.login');

  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );
  useReportPending(isPending);

  return (
    <form action={formAction} className={loginFormClasses.form}>
      <div>
        <label className={loginFormClasses.label}>
          {t('email')}
        </label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className={loginFormClasses.input}
        />
      </div>

      <div>
        <label className={loginFormClasses.label}>
          {t('password')}
        </label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={loginFormClasses.input}
        />
      </div>

      {state.error ? (
        <div className={loginFormClasses.error}>
          {state.error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className={loginFormClasses.submit}
      >
        {isPending ? t('submitting') : t('submit')}
      </button>
    </form>
  );
}
