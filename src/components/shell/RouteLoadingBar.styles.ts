/**
 * Tailwind-классы для `RouteLoadingBar`.
 * Держим стили рядом с компонентом, чтобы JSX оставался чистым.
 */
export const routeLoadingBarClasses = {
  // Компенсируем padding `AppShell.main` (px-6 py-8), чтобы полоска была вплотную под ticker/Marquee.
  wrapper: "-mt-8 -mx-6 h-[3px] overflow-hidden bg-[var(--color-surface)]",
  // Псевдо-прогресс: быстро доходит до 100% и остаётся заполненным до завершения навигации.
  // Анимация `route-loading-progress` определена в `src/app/globals.css`.
  bar: "relative h-full w-full origin-left scale-x-0 bg-black motion-safe:animate-[route-loading-progress_260ms_ease-out_forwards] motion-reduce:scale-x-100",
  // Полоски поверх прогресса (декоративный слой).
  stripes:
    "absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent_0,transparent_4px,rgba(255,255,255,.12)_4px,rgba(255,255,255,.12)_8px)]",
} as const;
