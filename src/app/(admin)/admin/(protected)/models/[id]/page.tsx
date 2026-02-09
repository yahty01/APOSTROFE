import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';

import {createSignedImageUrl} from '@/lib/supabase/images';
import {createSupabaseServerClientReadOnly} from '@/lib/supabase/server';

import {AssetForm} from '../AssetForm';
import {DeleteAssetButton} from '../DeleteAssetButton';
import {MediaManager, type AdminMediaItem} from '../MediaManager';

import {adminEditModelPageClasses} from './page.styles';

export const dynamic = 'force-dynamic';

/**
 * Конвертирует произвольный JSON в строку для textarea с красивыми отступами.
 * Используется при заполнении `AssetForm` из значений, полученных из БД.
 */
function jsonToTextarea(value: unknown) {
  if (!value) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

/**
 * Страница редактирования ассета (`/admin/models/[id]`).
 * Загружает ассет + медиа на сервере, подготавливает signed URLs и рендерит `AssetForm` + `MediaManager`.
 */
export default async function AdminEditModelPage({
  params
}: {
  params: Promise<{id: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const {id} = await params;
  const t = await getTranslations('admin.modelForm');
  const supabase = await createSupabaseServerClientReadOnly();

  const {data: asset, error: assetError} = await supabase
    .from('assets')
    .select(
      'id,document_id,title,description,category,license_type,status,measurements,details,is_published'
    )
    .eq('id', id)
    .maybeSingle();

  if (assetError || !asset) notFound();

  const {data: media} = await supabase
    .from('asset_media')
    .select('id,path,kind,order_index')
    .eq('asset_id', asset.id)
    .order('kind', {ascending: true})
    .order('order_index', {ascending: true});

  const heroRow = media?.find((m) => m.kind === 'hero') ?? null;
  const galleryRows = (media ?? []).filter((m) => m.kind === 'gallery');

  const hero: AdminMediaItem | null = heroRow
    ? {
        id: heroRow.id,
        path: heroRow.path,
        kind: 'hero',
        order_index: heroRow.order_index,
        url: (await createSignedImageUrl(supabase, heroRow.path, {
          width: 1200,
          quality: 82
        })) as string | null
      }
    : null;

  const gallery: AdminMediaItem[] = (
    await Promise.all(
      galleryRows.map(async (m) => ({
        id: m.id,
        path: m.path,
        kind: 'gallery' as const,
        order_index: m.order_index,
        url: await createSignedImageUrl(supabase, m.path, {width: 600, quality: 80})
      }))
    )
  ).filter((m) => Boolean(m));

  return (
    <div className={adminEditModelPageClasses.root}>
      <div className={adminEditModelPageClasses.header}>
        <div className={adminEditModelPageClasses.headerMeta}>
          <h1 className={adminEditModelPageClasses.title}>
            {t('editTitle')}
          </h1>
          <p className={adminEditModelPageClasses.subtitle}>
            {asset.id}
          </p>
        </div>
        <DeleteAssetButton assetId={asset.id} title={asset.title} />
      </div>

      <div className={adminEditModelPageClasses.panel}>
        <AssetForm
          assetId={asset.id}
          initialValues={{
            document_id: asset.document_id,
            title: asset.title,
            description: asset.description ?? '',
            category: asset.category ?? '',
            license_type: asset.license_type ?? '',
            status: asset.status ?? '',
            measurements: jsonToTextarea(asset.measurements),
            details: jsonToTextarea(asset.details),
            is_published: asset.is_published
          }}
        />
      </div>

      <div className={adminEditModelPageClasses.panel}>
        <MediaManager
          assetId={asset.id}
          documentId={asset.document_id}
          hero={hero}
          gallery={gallery}
        />
      </div>
    </div>
  );
}
