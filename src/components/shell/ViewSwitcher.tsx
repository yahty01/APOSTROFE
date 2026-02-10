"use client";

import { useEffect, useTransition } from "react";
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

  function setView(nextMode: ViewMode) {
    const params = new URLSearchParams(searchParams.toString());
    setModelsViewCookie(nextMode);
    params.set("view", nextMode);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  useEffect(() => {
    setModelsViewCookie(view);
  }, [view]);

  return (
    <label className={viewSwitcherClasses.root}>
      <span className={viewSwitcherClasses.labelText}>{t("view.label")}</span>
      <select
        value={view}
        disabled={isPending}
        onChange={(e) => {
          const nextMode = asViewMode(e.target.value);
          if (!nextMode) return;
          setView(nextMode);
        }}
        className={viewSwitcherClasses.select}
      >
        <option value="cards">{t("view.cards")}</option>
        <option value="list">{t("view.list")}</option>
      </select>
    </label>
  );
}
