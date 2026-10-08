'use client';

import {useTranslations} from 'next-intl';
import {routeLoadingBarClasses} from './RouteLoadingBar.styles';

export type LoadingBarProps = {
  ariaLabel?: string;
};

/**
 * Тонкая полоска загрузки для route transitions.
 * Подпись использует текущий язык интерфейса.
 */
export function LoadingBar({ariaLabel}: LoadingBarProps) {
  const t = useTranslations('common');
  return (
    <div
      role="progressbar"
      aria-label={ariaLabel ?? t('loading')}
      className={routeLoadingBarClasses.wrapper}
    >
      <div className={routeLoadingBarClasses.bar}>
        <div
          aria-hidden
          className={routeLoadingBarClasses.stripes}
        />
      </div>
    </div>
  );
}

export function RouteLoadingBar() {
  return <LoadingBar />;
}
