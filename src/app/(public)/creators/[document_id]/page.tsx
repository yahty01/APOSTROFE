import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';

import {createSignedImageUrl} from '@/lib/supabase/images';
import {createSupabasePublicClient} from '@/lib/supabase/public';
import {
  buildEntityLicenseRequestText,
  buildRequestInfoText,
  buildTelegramShareUrl
} from '@/lib/telegram';

import {GalleryItem} from '../../models/[document_id]/GalleryItem';
import {modelDetailPageClasses} from '../../models/[document_id]/page.styles';

export const dynamic = 'force-dynamic';

function formatIsoDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : value;
}

export default async function CreatorDetailPage({
  params
}: {
  params: Promise<{document_id: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const {document_id} = await params;
  const tPublic = await getTranslations('public');
  const tCommon = await getTranslations('common');

  let heroUrl: string | null = null;
  let galleryUrls: string[] = [];
  let asset: {
    id: string;
    document_id: string;
    title: string;
    description: string | null;
    license_type: string | null;
    status: string | null;
    creator_direction: string | null;
    updated_at: string;
  } | null = null;

  try {
    const supabase = createSupabasePublicClient();
    const {data, error: assetError} = await supabase
      .from('assets')
      .select(
        'id,document_id,title,description,license_type,status,creator_direction,updated_at'
      )
      .eq('document_id', document_id)
      .eq('entity_type', 'creator')
      .maybeSingle();

    if (assetError || !data) notFound();
    asset = data;

    const {data: media} = await supabase
      .from('asset_media')
      .select('path,kind,order_index')
      .eq('asset_id', data.id)
      .order('kind', {ascending: true})
      .order('order_index', {ascending: true});

    const heroPath =
      media?.find((m) => m.kind === 'hero')?.path ??
      media?.find((m) => m.kind === 'catalog')?.path ??
      null;
    const galleryPaths = (media ?? [])
      .filter((m) => m.kind === 'gallery')
      .sort((a, b) => a.order_index - b.order_index)
      .map((m) => m.path);

    heroUrl = heroPath
      ? await createSignedImageUrl(supabase, heroPath, {width: 1600, quality: 82})
      : null;

    galleryUrls = (
      await Promise.all(
        galleryPaths.map((p) =>
          createSignedImageUrl(supabase, p, {width: 1600, quality: 82})
        )
      )
    ).filter((u): u is string => Boolean(u));
  } catch {
    notFound();
  }

  if (!asset) notFound();

  const timestamp = formatIsoDate(asset.updated_at);
  const license = (asset.license_type || 'STANDARD').toUpperCase();
  const status = (asset.status || 'AVAILABLE').toUpperCase();
  const description = (asset.description || '').trim() || '—';
  const direction = (asset.creator_direction || '—').trim() || '—';
  const creatorName = (asset.title || asset.document_id).trim() || asset.document_id;

  const acquireHref = buildTelegramShareUrl(
    buildEntityLicenseRequestText(asset, 'creator')
  );
  const requestInfoHref = buildTelegramShareUrl(buildRequestInfoText(asset));

  return (
    <div className={modelDetailPageClasses.root}>
      <div className={modelDetailPageClasses.topRow}>
        <Link
          href="/creators"
          className={modelDetailPageClasses.backLink}
        >
          ← {tCommon('back').toUpperCase()}
        </Link>
      </div>

      <div className={modelDetailPageClasses.contentWrap}>
        <div className={modelDetailPageClasses.mainGrid}>
          <section className={modelDetailPageClasses.mediaSection}>
            <div className={modelDetailPageClasses.hero}>
              {heroUrl ? (
                <Image
                  src={heroUrl}
                  alt={creatorName}
                  fill
                  className={modelDetailPageClasses.heroImage}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                />
              ) : (
                <div className={modelDetailPageClasses.heroFallback}>
                  <span className="font-condensed text-[clamp(28px,5vw,64px)] tracking-[0.12em] text-[var(--color-ink)]">
                    {creatorName.toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </section>

          <section className={modelDetailPageClasses.detailsSection}>
            <h1 className={modelDetailPageClasses.title}>
              {creatorName}
            </h1>
            <div className={modelDetailPageClasses.meta}>
              {status} · {license} · {timestamp}
            </div>

            <div className={modelDetailPageClasses.blocks}>
              <div className={modelDetailPageClasses.block}>
                <div className={modelDetailPageClasses.blockTitle}>
                  {tPublic('asset.description')}
                </div>
                <div className={modelDetailPageClasses.blockText}>
                  {description}
                </div>
              </div>

              <div className={modelDetailPageClasses.block}>
                <div className={modelDetailPageClasses.blockTitle}>
                  {tPublic('asset.direction')}
                </div>
                <div className={modelDetailPageClasses.blockText}>
                  {direction}
                </div>
              </div>
            </div>

            <div className={modelDetailPageClasses.actions}>
              <a
                href={acquireHref}
                target="_blank"
                rel="noreferrer"
                className={modelDetailPageClasses.actionPrimary}
              >
                {`[ ${tPublic('cta.creatorCollaborate')} ]`}
              </a>
              <a
                href={requestInfoHref}
                target="_blank"
                rel="noreferrer"
                className={modelDetailPageClasses.actionSecondary}
              >
                {`[ ${tPublic('cta.creatorRequestDealmemo')} ]`}
              </a>
            </div>
          </section>
        </div>

        <section className={modelDetailPageClasses.gallerySection}>
          {galleryUrls.length ? (
            <div className={modelDetailPageClasses.galleryGrid}>
              {galleryUrls.map((url, idx) => {
                const isSolo =
                  galleryUrls.length % 2 === 1 && idx === galleryUrls.length - 1;
                return (
                  <GalleryItem
                    key={`${url}-${idx}`}
                    src={url}
                    alt={`${asset.document_id} ${idx + 1}`}
                    isSolo={isSolo}
                  />
                );
              })}
            </div>
          ) : (
            <div className={modelDetailPageClasses.galleryFallback}>
              {tPublic('detail.noThumbnails')}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
