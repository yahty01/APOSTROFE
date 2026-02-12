"use client";

import { useEffect, useMemo, useState } from "react";

import { getMarqueeVars, marqueeClasses } from "./Marquee.styles";

/**
 * Контракт настроек marquee, совпадающий со схемой таблицы `settings_marquee`.
 * Используется в layout’ах (для initial SSR) и в `/api/marquee` (для client refresh).
 */
export type MarqueeSettings = {
  enabled: boolean;
  text_ru: string;
  text_en: string;
  speed: number | null;
  direction: string | null;
};

/**
 * Текст по умолчанию, если админ ещё не заполнил строку или она пустая для текущей локали.
 */
function getFallbackText(locale: string) {
  return locale === "ru" ? "ЛИЦЕНЗИРУЕМ ИДЕНТИЧНОСТЬ" : "WE LICENSE IDENTITY";
}

/**
 * Выбирает поле текста по локали без дополнительной логики форматирования.
 * Используется в компоненте `Marquee` перед нормализацией и fallback.
 */
function pickText(settings: MarqueeSettings, locale: string) {
  return locale === "ru" ? settings.text_ru : settings.text_en;
}

/**
 * Нормализует скорость marquee (секунд на полный цикл) и ограничивает диапазон.
 * Это защищает анимацию от слишком быстрых/медленных значений из базы.
 */
function normalizeDurationSeconds(speed: number | null | undefined) {
  const value = typeof speed === "number" ? speed : null;
  if (!value || !Number.isFinite(value)) return 20;
  return Math.min(120, Math.max(6, value));
}

/**
 * Бегущая строка (ticker) для публичной и админской частей.
 * initial значения приходят с сервера из layout’а, а затем компонент сам подтягивает обновления из `/api/marquee`.
 */
export function Marquee({
  initial,
  locale,
}: {
  initial: MarqueeSettings;
  locale: string;
}) {
  const [settings, setSettings] = useState<MarqueeSettings>(initial);

  const durationSeconds = useMemo(
    () => normalizeDurationSeconds(settings.speed),
    [settings.speed],
  );

  const direction = settings.direction === "right" ? "right" : "left";
  const rawText = pickText(settings, locale).trim();
  const text = rawText || getFallbackText(locale);
  const style = getMarqueeVars(durationSeconds, direction);

  // Периодически обновляем настройки, чтобы изменения из админки появлялись без перезагрузки страницы.
  useEffect(() => {
    let isMounted = true;

    // Best-effort загрузка актуальных настроек; ошибки/плохие ответы просто игнорируем.
    async function refetch() {
      try {
        const res = await fetch("/api/marquee", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as MarqueeSettings;
        if (!isMounted) return;
        setSettings(json);
      } catch {
        // ignore
      }
    }

    refetch();
    const interval = window.setInterval(refetch, 8000);

    // При возвращении на вкладку/окно — обновляем сразу, чтобы ticker был актуальным.
    function onFocus() {
      void refetch();
    }

    window.addEventListener("focus", onFocus);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  if (!settings.enabled) return null;

  return (
    <div className={marqueeClasses.line}>
      <div className={marqueeClasses.wrapper}>
        <div className={marqueeClasses.marquee}>
          <div className={marqueeClasses.inner} style={style}>
            <span className={marqueeClasses.content}>{text}</span>
            <span className={marqueeClasses.content} aria-hidden>
              {text}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
