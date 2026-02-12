/**
 * Tailwind-классы для страницы `/models`.
 * Вынесены рядом со страницей, чтобы логика загрузки данных не смешивалась со стилями.
 *
 * Структура:
 * - `root` — общий вертикальный ритм страницы
 * - `toolbar*` / `stats*` — верхняя зона: счётчики + фильтры
 * - `errorPanel` / `emptyPanel` — состояния данных
 * - `pagination*` / `pageButton*` — пагинация
 * - `cta*` — нижний CTA-блок
 */
export const modelsPageClasses = {
  /** Вся страница: задаёт базовые отступы между секциями. */
  root: "space-y-8 md:space-y-12",

  // Верхняя зона (stats + фильтр категории)
  toolbarGrid:
    "grid grid-cols-1 gap-px bg-[var(--color-line)] md:grid-cols-[1fr_auto]",
  /** Левая панель в верхней зоне: "Всего / Страница". */
  statsPanel:
    "flex flex-col gap-4 bg-[var(--color-surface)] p-4 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] md:flex-row md:items-center md:justify-between",
  /** Контейнер с текстовой статистикой внутри `statsPanel`. */
  statsInfo: "flex flex-col",
  /** Вторая строка внутри `statsPanel` (например "Page 1/3"). */
  statsPageRow: "mt-1",
  /** Правая панель в верхней зоне: содержит `ModelsToolbar` (select категории). */
  toolbarPanel: "bg-[var(--color-surface)] p-4",

  // Состояния контента
  errorPanel:
    "ui-panel p-4 font-doc text-[11px] uppercase tracking-[0.16em] text-red-800",
  emptyPanel:
    "ui-panel p-6 text-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] md:p-10",

  // Пагинация
  paginationWrap:
    "flex flex-col gap-3 border-t ui-line pt-6 md:flex-row md:items-center md:justify-between",
  paginationLabel:
    "font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]",
  paginationButtons: "flex flex-wrap gap-2",
  /** Базовый стиль кнопки/ссылки пагинации (без состояния). */
  pageButtonBase:
    "flex h-10 items-center justify-center border px-4 font-doc text-[11px] uppercase tracking-[0.18em]",
  /** Активная (кликабельная) кнопка пагинации. */
  pageButtonEnabled:
    "border-[color:var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-surface),#000_6%)]",
  /** Неактивная (disabled) кнопка пагинации. */
  pageButtonDisabled:
    "cursor-not-allowed border-[color:var(--color-line)] bg-[color-mix(in_oklab,var(--color-surface),#000_6%)] text-[var(--color-muted)] opacity-60",
  /** Кнопка "ALL" в пагинации — показываем только на md+, чтобы не перегружать мобилку. */
  allButton:
    "hidden h-10 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-surface)] px-4 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-surface),#000_6%)] md:flex",

  // CTA
  ctaWrap: "py-10 md:py-16",
  ctaInner: "flex justify-center",
  ctaButton:
    "ui-btn-primary h-14 w-full max-w-md px-6 text-[16px] md:w-auto md:px-10",
} as const;
