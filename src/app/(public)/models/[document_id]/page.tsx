import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';

import {createSignedImageUrl} from '@/lib/supabase/images';
import {createSupabasePublicClient} from '@/lib/supabase/public';
import {
  buildLicenseRequestText,
  buildRequestInfoText,
  buildTelegramShareUrl
} from '@/lib/telegram';

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
 * Рендерит объект как список key/value (dl), если это "плоская" структура.
 * Используется для `measurements`/`details`, чтобы красиво показать JSON без принудительного `pre`.
 */
function renderKeyValue(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>);
  if (!entries.length) return null;
  return (
    <dl className={modelDetailPageClasses.kvGrid}>
      {entries.map(([k, v]) => (
        <div key={k} className={modelDetailPageClasses.kvItem}>
          <dt className={modelDetailPageClasses.kvKey}>
            {k}
          </dt>
          <dd className={modelDetailPageClasses.kvValue}>
            {typeof v === 'string' || typeof v === 'number' ? String(v) : '—'}
          </dd>
        </div>
      ))}
    </dl>
  );
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

  let heroUrl: string | null = null;
  let galleryUrls: string[] = [];

  // Все обращения к Supabase оборачиваем в try/catch, чтобы в случае проблем показывать корректный 404, а не 500.
  try {
    const supabase = createSupabasePublicClient();
    const {data: asset, error: assetError} = await supabase
      .from('assets')
      .select(
        'id,document_id,title,description,measurements,details,category,license_type,status,updated_at'
      )
      .eq('document_id', document_id)
      .eq('entity_type', 'model')
      .maybeSingle();

    if (assetError || !asset) notFound();

    const {data: media} = await supabase
      .from('asset_media')
      .select('path,kind,order_index')
      .eq('asset_id', asset.id)
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

    const timestamp = formatIsoDate(asset.updated_at);
    const license = (asset.license_type || 'STANDARD').toUpperCase();
    const status = (asset.status || 'AVAILABLE').toUpperCase();
    const description = (asset.description || asset.title || '').trim() || '—';

    const acquireHref = buildTelegramShareUrl(buildLicenseRequestText(asset));
    const requestInfoHref = buildTelegramShareUrl(buildRequestInfoText(asset));

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
                    src={heroUrl}
                    alt={asset.title}
                    fill
                    className={modelDetailPageClasses.heroImage}
                    sizes="(max-width: 1024px) 100vw, 40vw"
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
                {(asset.title || asset.document_id).trim() || asset.document_id}
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

                {asset.measurements ? (
                  <div className={modelDetailPageClasses.block}>
                    <div className={modelDetailPageClasses.blockTitle}>
                      {tPublic('detail.measurements').toUpperCase()}
                    </div>
                    <div className={modelDetailPageClasses.blockBody}>
                      {renderKeyValue(asset.measurements) ?? (
                        <pre className={modelDetailPageClasses.blockPre}>
                          {JSON.stringify(asset.measurements, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ) : null}

                {asset.details ? (
                  <div className={modelDetailPageClasses.block}>
                    <div className={modelDetailPageClasses.blockTitle}>
                      {tPublic('detail.details').toUpperCase()}
                    </div>
                    <div className={modelDetailPageClasses.blockBody}>
                      {renderKeyValue(asset.details) ?? (
                        <pre className={modelDetailPageClasses.blockPre}>
                          {JSON.stringify(asset.details, null, 2)}
                        </pre>
                      )}
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
  } catch {
    notFound();
  }
}
