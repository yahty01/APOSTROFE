import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';

import {createSignedImageUrl} from '@/lib/supabase/images';
import {createSupabaseServerClientReadOnly} from '@/lib/supabase/server';

import {AssetForm} from '../../models/AssetForm';
import {DeleteAssetButton} from '../../models/DeleteAssetButton';
import {MediaManager, type AdminMediaItem} from '../../models/MediaManager';
import {adminEditModelPageClasses} from '../../models/[id]/page.styles';

export const dynamic = 'force-dynamic';

export default async function AdminEditCreatorPage({
  params
}: {
  params: Promise<{id: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const {id} = await params;
  const tCommon = await getTranslations('common');
  const tCreators = await getTranslations('admin.creators');
  const supabase = await createSupabaseServerClientReadOnly();

  const {data: asset, error: assetError} = await supabase
    .from('assets')
    .select('id,document_id,title,description,creator_direction,license_type,status,is_published')
    .eq('id', id)
    .eq('entity_type', 'creator')
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
            {tCommon('edit')} {tCreators('title')}
          </h1>
          <p className={adminEditModelPageClasses.subtitle}>{asset.id}</p>
        </div>
        <DeleteAssetButton assetId={asset.id} title={asset.title} entityType="creator" />
      </div>

      <div className={adminEditModelPageClasses.panel}>
        <AssetForm
          assetId={asset.id}
          entityType="creator"
          redirectBasePath="/admin/creators"
          initialValues={{
            document_id: asset.document_id,
            title: asset.title,
            description: asset.description ?? '',
            creator_direction: asset.creator_direction ?? '',
            license_type: asset.license_type ?? '',
            status: asset.status ?? '',
            is_published: asset.is_published
          }}
        />
      </div>

      <div className={adminEditModelPageClasses.panel}>
        <MediaManager
          assetId={asset.id}
          documentId={asset.document_id}
          entityType="creator"
          allowGallery
          hero={hero}
          gallery={gallery}
        />
      </div>
    </div>
  );
}
