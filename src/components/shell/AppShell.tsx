import {appShellClasses} from './AppShell.styles';
import {NavigationPendingReporter} from './NavigationPendingReporter';
import {PendingLoadingBarHost} from './PendingLoadingBarHost';

/**
 * Базовый каркас страницы: фон, максимальная ширина, рамка и слоты для header/ticker/footer.
 * Используется в public/admin layout’ах, чтобы все разделы выглядели консистентно.
 */
export function AppShell({
  header,
  ticker,
  footer,
  children
}: {
  header: React.ReactNode;
  ticker?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={appShellClasses.outer}>
      <div className={appShellClasses.frame}>
        {header}
        {ticker}
        <main className={appShellClasses.main}>
          <NavigationPendingReporter />
          <PendingLoadingBarHost />
          {children}
        </main>
        {footer}
      </div>
    </div>
  );
}
