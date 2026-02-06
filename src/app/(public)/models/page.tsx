import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

import {AssetCards} from '@/components/models/AssetCards';
import {AssetsTable} from '@/components/models/AssetsTable';
import {ModelsToolbar} from '@/components/models/ModelsToolbar';
import type {AssetListItem} from '@/components/models/types';
import {createSignedImageUrl} from '@/lib/supabase/images';
import {createSupabasePublicClient} from '@/lib/supabase/public';
import {buildGenericLicenseRequestText, buildTelegramShareUrl} from '@/lib/telegram';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

function firstString(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function asInt(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function buildSearchParams(
  current: Record<string, string | string[] | undefined>,
  patch: Record<string, string | null>
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

export default async function ModelsPage({
  searchParams
}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const t = await getTranslations('public');
  const tCommon = await getTranslations('common');

  const view = firstString(sp.view);
  const viewMode = view === 'list' ? 'list' : 'cards';

  const page = asInt(firstString(sp.page), 1);
  const categoryRaw = firstString(sp.category);
  const category = categoryRaw && categoryRaw !== 'all' ? categoryRaw : null;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let items: AssetListItem[] = [];
  let categories: string[] = [];
  let count = 0;
  let errorMessage: string | null = null;

  try {
    const supabase = createSupabasePublicClient();

    const [{data: categoriesData}, assetsRes] = await Promise.all([
      supabase
        .from('assets')
        .select('category')
        .not('category', 'is', null),
      supabase
        .from('assets')
        .select(
          'id,document_id,title,description,category,license_type,status,updated_at',
          {count: 'exact'}
        )
        .order('updated_at', {ascending: false})
        .match(category ? {category} : {})
        .range(from, to)
    ]);

    const rawCategories = (categoriesData ?? [])
      .map((row) => row.category)
      .filter((v): v is string => typeof v === 'string')
      .map((v) => v.trim())
      .filter(Boolean);

    categories = Array.from(new Set(rawCategories)).sort((a, b) =>
      a.localeCompare(b, 'ru')
    );

    if (assetsRes.error) throw assetsRes.error;
    count = assetsRes.count ?? 0;

    const assets = assetsRes.data ?? [];
    if (!assets.length) {
      items = [];
    } else {
      const assetIds = assets.map((a) => a.id);
      const {data: mediaData} = await supabase
        .from('asset_media')
        .select('asset_id,path,kind,order_index')
        .in('asset_id', assetIds)
        .order('kind', {ascending: true})
        .order('order_index', {ascending: true});

      const mediaByAsset = new Map<
        string,
        {path: string; kind: 'hero' | 'gallery'; order_index: number}[]
      >();
      for (const m of mediaData ?? []) {
        const list = mediaByAsset.get(m.asset_id) ?? [];
        list.push({
          path: m.path,
          kind: m.kind,
          order_index: m.order_index
        });
        mediaByAsset.set(m.asset_id, list);
      }

      items = await Promise.all(
        assets.map(async (a) => {
          const media = mediaByAsset.get(a.id) ?? [];
          const hero = media.find((m) => m.kind === 'hero')?.path ?? null;
          const gallery = media
            .filter((m) => m.kind === 'gallery')
            .sort((x, y) => x.order_index - y.order_index)[0]?.path ?? null;

          const previewPath = hero ?? gallery;
          const previewUrl = previewPath
            ? await createSignedImageUrl(supabase, previewPath, {
                width: 720,
                quality: 80
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
            preview_url: previewUrl
          };
        })
      );
    }
  } catch (e) {
    errorMessage =
      e instanceof Error ? e.message : 'Failed to load models (unknown error)';
  }

  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < pages ? page + 1 : null;

  const genericTelegramHref = buildTelegramShareUrl(
    buildGenericLicenseRequestText()
  );

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <h1 className="font-condensed text-[clamp(48px,6vw,72px)] leading-[0.88] uppercase tracking-[0.12em]">
          {t('catalogTitle')}
        </h1>
        <p className="max-w-3xl font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {t('catalogSubtitle')}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-px bg-[var(--color-line)] md:grid-cols-[1fr_auto]">
        <div className="bg-[var(--color-surface)] p-4 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          <div>{t('pagination.items', {count})}</div>
          <div className="mt-1">{t('pagination.page', {page, pages})}</div>
        </div>
        <div className="bg-[var(--color-surface)] p-4">
          <ModelsToolbar categories={categories} />
        </div>
      </div>

      {errorMessage ? (
        <div className="ui-panel p-4 font-doc text-[11px] uppercase tracking-[0.16em] text-red-800">
          {errorMessage}
        </div>
      ) : null}

      {!errorMessage && items.length === 0 ? (
        <div className="ui-panel p-10 text-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {t('noResults')}
        </div>
      ) : null}

      {items.length > 0 ? (
        viewMode === 'list' ? (
          <AssetsTable items={items} />
        ) : (
          <AssetCards items={items} />
        )
      ) : null}

      <div className="flex flex-col gap-3 border-t ui-line pt-6 md:flex-row md:items-center md:justify-between">
        <div className="font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {t('pagination.page', {page, pages})}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            aria-disabled={!prevPage}
            className={`flex h-10 items-center justify-center border px-4 font-doc text-[11px] uppercase tracking-[0.18em] ${
              prevPage
                ? 'border-[color:var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]'
                : 'cursor-not-allowed border-[color:var(--color-line)] bg-[color-mix(in_oklab,var(--color-paper),#000_6%)] text-[var(--color-muted)] opacity-60'
            }`}
            href={
              prevPage
                ? `/models?${buildSearchParams(sp, {
                    page: String(prevPage)
                  }).toString()}`
                : '#'
            }
          >
            {t('pagination.previous')}
          </Link>
          <Link
            aria-disabled={!nextPage}
            className={`flex h-10 items-center justify-center border px-4 font-doc text-[11px] uppercase tracking-[0.18em] ${
              nextPage
                ? 'border-[color:var(--color-line)] bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]'
                : 'cursor-not-allowed border-[color:var(--color-line)] bg-[color-mix(in_oklab,var(--color-paper),#000_6%)] text-[var(--color-muted)] opacity-60'
            }`}
            href={
              nextPage
                ? `/models?${buildSearchParams(sp, {
                    page: String(nextPage)
                  }).toString()}`
                : '#'
            }
          >
            {t('pagination.next')}
          </Link>
          <Link
            className="hidden h-10 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-4 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)] md:flex"
            href={`/models?${buildSearchParams(sp, {page: null, category: null}).toString()}`}
          >
            {tCommon('all')}
          </Link>
        </div>
      </div>

      <div className="py-16">
        <div className="flex justify-center">
          <a
            href={genericTelegramHref}
            target="_blank"
            rel="noreferrer"
            className="ui-btn-primary h-14 px-10 text-[16px]"
          >
            {t('cta.requestLicense')}
          </a>
        </div>
      </div>
    </div>
  );
}
