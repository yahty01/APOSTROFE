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
    <div className="min-h-dvh bg-[var(--color-paper)] p-6 text-[var(--color-ink)]">
      <div className="ui-frame mx-auto w-full max-w-[1400px]">
        {header}
        {ticker}
        <main className="px-6 py-8">{children}</main>
        {footer}
      </div>
    </div>
  );
}

