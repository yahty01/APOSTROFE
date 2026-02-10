import {routeLoadingBarClasses} from './RouteLoadingBar.styles';

export type LoadingBarProps = {
  ariaLabel?: string;
};

/**
 * Тонкая полоска загрузки для route transitions.
 * Компонент без состояния/хуков, чтобы его можно было рендерить из server components.
 */
export function LoadingBar({ariaLabel = 'Loading'}: LoadingBarProps) {
  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
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
