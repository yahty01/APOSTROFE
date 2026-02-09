"use client";

import { useEffect, useMemo, useTransition } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useReportPending } from "@/lib/pending";

import { viewSwitcherClasses } from "./ViewSwitcher.styles";

type ViewMode = "cards" | "list";

/**
 * Безопасно парсит значение `view` из query/cookie.
 * Используется в `ViewSwitcher`, чтобы не поломаться на произвольных строках.
 */
function asViewMode(value: string | null): ViewMode | null {
  if (value === "cards" || value === "list") return value;
  return null;
}

/**
 * Утилита для кнопки "SWITCH": переключает режим таблица/карточки.
 */
function nextView(current: ViewMode): ViewMode {
  return current === "cards" ? "list" : "cards";
}

/**
 * Переключатель режима отображения каталога моделей.
 * Используется на странице `/models`: пишет `view` в query и запоминает выбор в cookie `models_view`.
 */
function setModelsViewCookie(mode: ViewMode) {
  const maxAge = 60 * 60 * 24 * 365; // 1 год
  document.cookie = `models_view=${mode}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function ViewSwitcher({
  initialView = "cards",
}: {
  initialView?: ViewMode;
}) {
  const t = useTranslations("public");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  useReportPending(isPending);

  const view = asViewMode(searchParams.get("view")) ?? initialView;

  const url = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    return (nextMode: ViewMode) => {
      setModelsViewCookie(nextMode);
      params.set("view", nextMode);
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    };
  }, [pathname, router, searchParams, startTransition]);

  useEffect(() => {
    setModelsViewCookie(view);
  }, [view]);

  return (
    <div className={viewSwitcherClasses.root}>
      <button
        type="button"
        disabled={isPending}
        onClick={() => url("cards")}
        className={`${viewSwitcherClasses.segmentBase} ${
          viewSwitcherClasses.segmentBg
        } ${view === "cards" ? viewSwitcherClasses.segmentActive : ""}`}
      >
        {t("view.label")}: {t("view.cards").toUpperCase()}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => url("list")}
        className={`${viewSwitcherClasses.segmentBase} ${
          viewSwitcherClasses.segmentBg
        } ${view === "list" ? viewSwitcherClasses.segmentActive : ""}`}
      >
        {t("view.label")}: {t("view.list").toUpperCase()}
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => url(nextView(view))}
        className={`${viewSwitcherClasses.segmentBase} ${viewSwitcherClasses.segmentBg}`}
      >
        {t("view.switch")}
      </button>
    </div>
  );
}
