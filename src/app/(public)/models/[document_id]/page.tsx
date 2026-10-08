import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';

import {createPublicImages, type PublicImage} from '@/lib/supabase/public-images';
import {PROFILE_IMAGE_SIZES} from '@/components/models/image-sizes';
import {createSupabasePublicClient} from '@/lib/supabase/public';
import {
  buildAssetInfoInquiryText,
  buildAssetLicenseInquiryText,
  buildTelegramDirectMessageUrl
} from '@/lib/telegram';

import {PropertyGrid} from '@/components/models/PropertyGrid';
import {SocialLinks} from '@/components/models/SocialLinks';
import {hasProperties, splitModelDetails} from '@/lib/assets/model-properties';

import {GalleryItem} from './GalleryItem';
import {modelDetailPageClasses} from './page.styles';

export const dynamic = 'force-dynamic';

/**
 * Вытаскивает YYYY-MM-DD из ISO timestamp.
 * Используется на странице модели для компактного отображения времени обновления.
 */
function formatIsoDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : value;
}

/**
 * Страница детального просмотра модели (`/models/[document_id]`).
 * Делает server-side запросы в Supabase (ассет + медиа), строит signed URLs для изображений и CTA в Telegram.
 * При любой ошибке (включая отсутствие записи) отдаёт 404 через `notFound()`.
 */
export default async function ModelDetailPage({
  params
}: {
  params: Promise<{document_id: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const {document_id} = await params;
  const tPublic = await getTranslations('public');
  const tCommon = await getTranslations('common');

  let heroUrl: PublicImage | null = null;
  let galleryUrls: PublicImage[] = [];

  // Все обращения к Supabase оборачиваем в try/catch, чтобы в случае проблем показывать корректный 404, а не 500.
  try {
    const supabase = createSupabasePublicClient();
    const {data: asset, error: assetError} = await supabase
      .from('assets')
      .select(
        'id,document_id,title,description,measurements,details,category,model_type,license_type,status,updated_at,asset_media(path,kind,order_index)'
      )
      .eq('document_id', document_id)
      .eq('entity_type', 'model')
      .maybeSingle();

    if (assetError || !asset) notFound();

    const media = [...asset.asset_media].sort((a, b) => a.order_index - b.order_index);

    const heroPath =
      media?.find((m) => m.kind === 'hero')?.path ??
      media?.find((m) => m.kind === 'catalog')?.path ??
      null;
    const galleryPaths = (media ?? [])
      .filter((m) => m.kind === 'gallery')
      .sort((a, b) => a.order_index - b.order_index)
      .map((m) => m.path);

    const imageUrls = await createPublicImages([
      ...(heroPath ? [heroPath] : []),
      ...galleryPaths
    ]);
    heroUrl = heroPath ? imageUrls.get(heroPath) ?? null : null;
    galleryUrls = galleryPaths
      .map((path) => imageUrls.get(path))
      .filter((image): image is PublicImage => Boolean(image));

    const timestamp = formatIsoDate(asset.updated_at);
    const license = (asset.license_type || 'STANDARD').toUpperCase();
    const status = (asset.status || 'AVAILABLE').toUpperCase();
    const modelType = asset.model_type || asset.category;
    const description = (asset.description || asset.title || '').trim() || '—';
    const modelName = (asset.title || document_id).replace(/_/g, ' ').trim();
    const {links: socialLinks, properties: details} = splitModelDetails(asset.details);

    const acquireHref = buildTelegramDirectMessageUrl(
      buildAssetLicenseInquiryText(asset)
    );
    const requestInfoHref = buildTelegramDirectMessageUrl(
      buildAssetInfoInquiryText(asset)
    );

    return (
      <div className={modelDetailPageClasses.root}>
        <div className={modelDetailPageClasses.topRow}>
          <Link
            href="/models"
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
                    src={heroUrl.url}
                    placeholder={heroUrl.blurDataURL ? "blur" : "empty"}
                    blurDataURL={heroUrl.blurDataURL}
                    alt={asset.title}
                    fill
                    className={modelDetailPageClasses.heroImage}
                    sizes={PROFILE_IMAGE_SIZES}
                    style={{objectFit: 'contain', objectPosition: 'center'}}
                    priority
                  />
                ) : (
                  <div className={modelDetailPageClasses.heroFallback}>
                    {tPublic('detail.noHeroImage')}
                  </div>
                )}
              </div>
            </section>

            <section className={modelDetailPageClasses.detailsSection}>
              <h1 className={modelDetailPageClasses.title}>
                {modelName}
              </h1>
              <div className={modelDetailPageClasses.meta}>
                {status} · {license} · {timestamp}
                {modelType ? <span className="mt-2 block">{tPublic('asset.modelType')}: {modelType.replace(/_/g, ' ')}</span> : null}
                <span className={modelDetailPageClasses.documentId}>{asset.document_id}</span>
              </div>

              <div className={modelDetailPageClasses.socialSection}>
                <SocialLinks links={socialLinks} label={tPublic('detail.socialLinks')} />
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

                {hasProperties(asset.measurements) ? (
                  <div className={modelDetailPageClasses.block}>
                    <div className={modelDetailPageClasses.blockTitle}>
                      {tPublic('detail.measurements').toUpperCase()}
                    </div>
                    <div className={modelDetailPageClasses.blockBody}>
                      <PropertyGrid value={asset.measurements} />
                    </div>
                  </div>
                ) : null}

                {hasProperties(details) ? (
                  <div className={modelDetailPageClasses.block}>
                    <div className={modelDetailPageClasses.blockTitle}>
                      {tPublic('detail.details').toUpperCase()}
                    </div>
                    <div className={modelDetailPageClasses.blockBody}>
                      <PropertyGrid value={details} />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className={modelDetailPageClasses.actions}>
                <a
                  href={acquireHref}
                  target="_blank"
                  rel="noreferrer"
                  className={modelDetailPageClasses.actionPrimary}
                >
                  {`[ ${tPublic('cta.requestLicense')} ]`}
                </a>
                <a
                  href={requestInfoHref}
                  target="_blank"
                  rel="noreferrer"
                  className={modelDetailPageClasses.actionSecondary}
                >
                  {`[ ${tPublic('cta.requestInfo')} ]`}
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
                      key={`${url.url}-${idx}`}
                      src={url.url}
                      blurDataURL={url.blurDataURL}
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
  } catch {
    notFound();
  }
}
