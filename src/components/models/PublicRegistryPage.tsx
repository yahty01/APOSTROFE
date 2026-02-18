import Link from 'next/link';
import {cookies} from 'next/headers';
import {getTranslations} from 'next-intl/server';

import {ViewSwitcher} from '@/components/shell/ViewSwitcher';
import {modelsPageClasses} from '@/app/(public)/models/page.styles';
import {createSignedImageUrl} from '@/lib/supabase/images';
import {createSupabasePublicClient} from '@/lib/supabase/public';
import {
  buildCollaborateWithUsText,
  buildTelegramDirectMessageUrl
} from '@/lib/telegram';

import {AssetCards} from './AssetCards';
import {AssetsTable} from './AssetsTable';
import {ModelsToolbar} from './ModelsToolbar';
import type {
  AssetEntityType,
  AssetFieldKey,
  AssetListItem,
  AssetMediaMode
} from './types';

const PAGE_SIZE = 12;

function firstString(value: string | string[] | undefined): string | undefined {
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

export type RegistryPageConfig = {
  route: '/models' | '/creators' | '/influencers';
  section: 'models' | 'creators' | 'influencers';
  entityType: AssetEntityType;
  fields: AssetFieldKey[];
  filterColumn: 'model_type' | 'creator_direction' | 'influencer_topic';
  filterLabelKey: string;
  noResultsKey: string;
  mediaMode: AssetMediaMode;
  detailBasePath?: string;
};

export async function PublicRegistryPage({
  searchParams,
  config
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  config: RegistryPageConfig;
}) {
  const sp = await searchParams;

  const t = await getTranslations('public');
  const tCommon = await getTranslations('common');

  const viewRaw = firstString(sp.view);
  const cookieStore = await cookies();
  const cookieKey = `${config.section}_view`;
  const cookieView =
    cookieStore.get(cookieKey)?.value ??
    (config.section === 'models' ? cookieStore.get('models_view')?.value : undefined);
  const viewMode =
    viewRaw === 'list'
      ? 'list'
      : viewRaw === 'cards'
        ? 'cards'
        : cookieView === 'list'
          ? 'list'
          : 'cards';

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

    const categoriesPromise = supabase
      .from('assets')
      .select(config.filterColumn)
      .eq('entity_type', config.entityType)
      .not(config.filterColumn, 'is', null);

    let assetsQuery = supabase
      .from('assets')
      .select(
        'id,entity_type,document_id,title,description,license_type,status,created_at,updated_at,model_type,creator_direction,influencer_topic,influencer_platforms',
        {count: 'exact'}
      )
      .eq('entity_type', config.entityType)
      .order('created_at', {ascending: false})
      .range(from, to);

    if (category) assetsQuery = assetsQuery.eq(config.filterColumn, category);

    const [{data: categoriesData}, assetsRes] = await Promise.all([
      categoriesPromise,
      assetsQuery
    ]);

    const rawCategories = (categoriesData ?? [])
      .map((row) => {
        const value = (row as Record<string, unknown>)[config.filterColumn];
        return typeof value === 'string' ? value.trim() : '';
      })
      .filter(Boolean);

    categories = Array.from(new Set(rawCategories)).sort((a, b) =>
      a.localeCompare(b, 'ru')
    );

    if (assetsRes.error) throw assetsRes.error;
    count = assetsRes.count ?? 0;

    const assets = assetsRes.data ?? [];
    if (!assets.length) {
      items = [];
    } else if (config.mediaMode === 'title') {
      items = assets.map((a) => ({
        id: a.id,
        entity_type: (a.entity_type ?? config.entityType) as AssetEntityType,
        document_id: a.document_id,
        title: a.title,
        description: a.description,
        license_type: a.license_type,
        status: a.status,
        created_at: a.created_at,
        updated_at: a.updated_at,
        model_type: a.model_type,
        creator_direction: a.creator_direction,
        influencer_topic: a.influencer_topic,
        influencer_platforms: a.influencer_platforms,
        preview_url: null
      }));
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
        {path: string; kind: 'catalog' | 'hero' | 'gallery'; order_index: number}[]
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
          const catalog = media.find((m) => m.kind === 'catalog')?.path ?? null;
          const hero = media.find((m) => m.kind === 'hero')?.path ?? null;

          const previewPath = catalog ?? hero;
          const previewUrl = previewPath
            ? await createSignedImageUrl(supabase, previewPath, {
                width: 720,
                quality: 80
              })
            : null;

          return {
            id: a.id,
            entity_type: (a.entity_type ?? config.entityType) as AssetEntityType,
            document_id: a.document_id,
            title: a.title,
            description: a.description,
            license_type: a.license_type,
            status: a.status,
            created_at: a.created_at,
            updated_at: a.updated_at,
            model_type: a.model_type,
            creator_direction: a.creator_direction,
            influencer_topic: a.influencer_topic,
            influencer_platforms: a.influencer_platforms,
            preview_url: previewUrl
          };
        })
      );
    }
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : 'Failed to load assets';
  }

  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < pages ? page + 1 : null;

  const genericTelegramHref = buildTelegramDirectMessageUrl(
    buildCollaborateWithUsText()
  );

  return (
    <div className={modelsPageClasses.root}>
      <div className={modelsPageClasses.toolbarPanel}>
        <div className={modelsPageClasses.toolbarInner}>
          <div className={modelsPageClasses.statsInfo}>
            <div>{t('pagination.items', {count})}</div>
            <div className={modelsPageClasses.statsPageRow}>
              {t('pagination.page', {page, pages})}
            </div>
          </div>

          <div className={modelsPageClasses.toolbarControls}>
            <ViewSwitcher initialView={viewMode} cookieKey={cookieKey} />
            <div aria-hidden className={modelsPageClasses.toolbarDivider} />
            <ModelsToolbar
              categories={categories}
              label={t(config.filterLabelKey)}
            />
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className={modelsPageClasses.errorPanel}>{errorMessage}</div>
      ) : null}

      {!errorMessage && items.length === 0 ? (
        <div className={modelsPageClasses.emptyPanel}>{t(config.noResultsKey)}</div>
      ) : null}

      {items.length > 0 ? (
        viewMode === 'list' ? (
          <AssetsTable
            items={items}
            fields={config.fields}
            detailBasePath={config.detailBasePath}
          />
        ) : (
          <AssetCards
            items={items}
            fields={config.fields}
            entityType={config.entityType}
            mediaMode={config.mediaMode}
            detailBasePath={config.detailBasePath}
          />
        )
      ) : null}

      <div className={modelsPageClasses.paginationWrap}>
        <div className={modelsPageClasses.paginationLabel}>
          {t('pagination.page', {page, pages})}
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
                ? `${config.route}?${buildSearchParams(sp, {
                    page: String(prevPage)
                  }).toString()}`
                : '#'
            }
          >
            {t('pagination.previous')}
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
                ? `${config.route}?${buildSearchParams(sp, {
                    page: String(nextPage)
                  }).toString()}`
                : '#'
            }
          >
            {t('pagination.next')}
          </Link>
          <Link
            className={modelsPageClasses.allButton}
            href={`${config.route}?${buildSearchParams(sp, {page: null, category: null}).toString()}`}
          >
            {tCommon('all')}
          </Link>
        </div>
      </div>

      <div className={modelsPageClasses.ctaWrap}>
        <div className={modelsPageClasses.ctaInner}>
          <a
            href={genericTelegramHref}
            target='_blank'
            rel='noreferrer'
            className={modelsPageClasses.ctaButton}
          >
            {`[ ${t('cta.collaborateWithUs')} ]`}
          </a>
        </div>
      </div>
    </div>
  );
}
