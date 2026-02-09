/**
 * Tailwind-классы для `RouteLoadingBar`.
 * Держим стили рядом с компонентом, чтобы JSX оставался чистым.
 */
export const routeLoadingBarClasses = {
  // Абсолютная overlay-полоска внутри `AppShell.main`, чтобы можно было рендерить несколько раз
  // (route loading + pending) без удвоения высоты/сдвигов layout.
  wrapper:
    "pointer-events-none absolute inset-x-0 top-0 h-[5px] overflow-hidden bg-[var(--color-surface)] motion-safe:animate-[loading-bar-pulse_4s_ease-in-out_infinite]",
  // Псевдо-прогресс: быстро доходит до 100% и остаётся заполненным до завершения навигации.
  // Анимация `route-loading-progress` определена в `src/app/globals.css`.
  bar: "h-full w-full origin-left scale-x-0 bg-black motion-safe:animate-[route-loading-progress_700ms_ease-out_forwards] motion-reduce:scale-x-100",
  // Двигающиеся полосы внутри прогресс-бара (сделаны длиннее и реже).
  // Используем `@keyframes marquee-x` из `src/components/Marquee.css`.
  stripes:
    "h-full w-[200%] opacity-25 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.55)_0_96px,transparent_96px_240px)] motion-safe:animate-[marquee-x_1.4s_linear_infinite]",
} as const;
