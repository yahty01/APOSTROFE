/**
 * Tailwind-классы для `AppShell`.
 * Храним рядом с компонентом, чтобы в JSX оставалась только структура, а стили правились в одном месте.
 */
export const appShellClasses = {
  outer: "min-h-dvh bg-[var(--color-paper)] p-0 text-[var(--color-ink)]",
  frame: "ui-frame mx-auto w-full max-w-[2400px]",
  main: "relative px-6 py-8",
} as const;
