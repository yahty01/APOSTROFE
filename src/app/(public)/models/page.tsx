import Link from "next/link";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

import { AssetCards } from "@/components/models/AssetCards";
import { AssetsTable } from "@/components/models/AssetsTable";
import { ModelsToolbar } from "@/components/models/ModelsToolbar";
import type { AssetListItem } from "@/components/models/types";
import { ViewSwitcher } from "@/components/shell/ViewSwitcher";
import { createSignedImageUrl } from "@/lib/supabase/images";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import {
  buildGenericLicenseRequestText,
  buildTelegramShareUrl,
} from "@/lib/telegram";

import { modelsPageClasses } from "./page.styles";

export const dynamic = "force-dynamic";

/**
 * Размер страницы каталога моделей (публичная часть).
 * Используется для вычисления диапазона `.range(from, to)` в Supabase запросе.
 */
const PAGE_SIZE = 12;

/**
 * Нормализует значение query-параметра Next.js (string | string[]) к одиночной строке.
 * Используется на сервере для `searchParams`.
 */
function firstString(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

/**
 * Безопасный парсер положительного int из строки.
 * Используется для `page`, чтобы не падать на мусорных query-параметрах.
 */
function asInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * Строит строку query параметров на основе текущих и patch-изменений.
 * Используется для ссылок пагинации и кнопки "ALL", сохраняя остальные параметры.
 */
function buildSearchParams(
  current: Record<string, string | string[] | undefined>,
  patch: Record<string, string | null>,
) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(current)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, value);
    }
  }
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) params.delete(key);
    else params.set(key, value);
  }
  return params;
}

/**
 * Публичная страница каталога моделей (`/models`).
 * Загружает данные из Supabase на сервере, строит превью-ссылки на изображения и рендерит list/cards view.
 */
export default async function ModelsPage({
  searchParams,
}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const t = await getTranslations("public");
  const tCommon = await getTranslations("common");

  const viewRaw = firstString(sp.view);
  const cookieStore = await cookies();
  const cookieView = cookieStore.get("models_view")?.value;
  const viewMode =
    viewRaw === "list"
      ? "list"
      : viewRaw === "cards"
        ? "cards"
        : cookieView === "list"
          ? "list"
          : "cards";

  const page = asInt(firstString(sp.page), 1);
  const categoryRaw = firstString(sp.category);
  const category = categoryRaw && categoryRaw !== "all" ? categoryRaw : null;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let items: AssetListItem[] = [];
  let categories: string[] = [];
  let count = 0;
  let errorMessage: string | null = null;

  // Загружаем категории и ассеты параллельно; медиа подтягиваем отдельным запросом только если есть результаты.
  try {
    const supabase = createSupabasePublicClient();

    const [{ data: categoriesData }, assetsRes] = await Promise.all([
      supabase.from("assets").select("category").not("category", "is", null),
      supabase
        .from("assets")
        .select(
          "id,document_id,title,description,category,license_type,status,updated_at",
          { count: "exact" },
        )
        .order("updated_at", { ascending: false })
        .match(category ? { category } : {})
        .range(from, to),
    ]);

    const rawCategories = (categoriesData ?? [])
      .map((row) => row.category)
      .filter((v): v is string => typeof v === "string")
      .map((v) => v.trim())
      .filter(Boolean);

    categories = Array.from(new Set(rawCategories)).sort((a, b) =>
      a.localeCompare(b, "ru"),
    );

    if (assetsRes.error) throw assetsRes.error;
    count = assetsRes.count ?? 0;

    const assets = assetsRes.data ?? [];
    if (!assets.length) {
      items = [];
    } else {
      const assetIds = assets.map((a) => a.id);
      const { data: mediaData } = await supabase
        .from("asset_media")
        .select("asset_id,path,kind,order_index")
        .in("asset_id", assetIds)
        .order("kind", { ascending: true })
        .order("order_index", { ascending: true });

      const mediaByAsset = new Map<
        string,
        { path: string; kind: "hero" | "gallery"; order_index: number }[]
      >();
      for (const m of mediaData ?? []) {
        const list = mediaByAsset.get(m.asset_id) ?? [];
        list.push({
          path: m.path,
          kind: m.kind,
          order_index: m.order_index,
        });
        mediaByAsset.set(m.asset_id, list);
      }

      items = await Promise.all(
        assets.map(async (a) => {
          const media = mediaByAsset.get(a.id) ?? [];
          const hero = media.find((m) => m.kind === "hero")?.path ?? null;
          const gallery =
            media
              .filter((m) => m.kind === "gallery")
              .sort((x, y) => x.order_index - y.order_index)[0]?.path ?? null;

          const previewPath = hero ?? gallery;
          const previewUrl = previewPath
            ? await createSignedImageUrl(supabase, previewPath, {
                width: 720,
                quality: 80,
              })
            : null;

          return {
            id: a.id,
            document_id: a.document_id,
            title: a.title,
            description: a.description,
            category: a.category,
            license_type: a.license_type,
            status: a.status,
            updated_at: a.updated_at,
            preview_url: previewUrl,
          };
        }),
      );
    }
  } catch (e) {
    errorMessage =
      e instanceof Error ? e.message : "Failed to load models (unknown error)";
  }

  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < pages ? page + 1 : null;

  const genericTelegramHref = buildTelegramShareUrl(
    buildGenericLicenseRequestText(),
  );

  return (
    <div className={modelsPageClasses.root}>
      <div className={modelsPageClasses.toolbarPanel}>
        <div className={modelsPageClasses.toolbarInner}>
          <div className={modelsPageClasses.statsInfo}>
            <div>{t("pagination.items", { count })}</div>
            <div className={modelsPageClasses.statsPageRow}>
              {t("pagination.page", { page, pages })}
            </div>
          </div>

          <div className={modelsPageClasses.toolbarControls}>
            <ViewSwitcher initialView={viewMode} />
            <div aria-hidden className={modelsPageClasses.toolbarDivider} />
            <ModelsToolbar categories={categories} />
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className={modelsPageClasses.errorPanel}>{errorMessage}</div>
      ) : null}

      {!errorMessage && items.length === 0 ? (
        <div className={modelsPageClasses.emptyPanel}>{t("noResults")}</div>
      ) : null}

      {items.length > 0 ? (
        viewMode === "list" ? (
          <AssetsTable items={items} />
        ) : (
          <AssetCards items={items} />
        )
      ) : null}

      <div className={modelsPageClasses.paginationWrap}>
        <div className={modelsPageClasses.paginationLabel}>
          {t("pagination.page", { page, pages })}
        </div>
        <div className={modelsPageClasses.paginationButtons}>
          <Link
            aria-disabled={!prevPage}
            className={`${modelsPageClasses.pageButtonBase} ${
              prevPage
                ? modelsPageClasses.pageButtonEnabled
                : modelsPageClasses.pageButtonDisabled
            }`}
            href={
              prevPage
                ? `/models?${buildSearchParams(sp, {
                    page: String(prevPage),
                  }).toString()}`
                : "#"
            }
          >
            {t("pagination.previous")}
          </Link>
          <Link
            aria-disabled={!nextPage}
            className={`${modelsPageClasses.pageButtonBase} ${
              nextPage
                ? modelsPageClasses.pageButtonEnabled
                : modelsPageClasses.pageButtonDisabled
            }`}
            href={
              nextPage
                ? `/models?${buildSearchParams(sp, {
                    page: String(nextPage),
                  }).toString()}`
                : "#"
            }
          >
            {t("pagination.next")}
          </Link>
          <Link
            className={modelsPageClasses.allButton}
            href={`/models?${buildSearchParams(sp, { page: null, category: null }).toString()}`}
          >
            {tCommon("all")}
          </Link>
        </div>
      </div>

      <div className={modelsPageClasses.ctaWrap}>
        <div className={modelsPageClasses.ctaInner}>
          <a
            href={genericTelegramHref}
            target="_blank"
            rel="noreferrer"
            className={modelsPageClasses.ctaButton}
          >
            {t("cta.requestLicense")}
          </a>
        </div>
      </div>
    </div>
  );
}
