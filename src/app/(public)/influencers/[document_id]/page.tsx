import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';

import {createSignedImageUrl} from '@/lib/supabase/images';
import {createSupabasePublicClient} from '@/lib/supabase/public';
import {
  buildAssetInfoInquiryText,
  buildAssetLicenseInquiryText,
  buildTelegramDirectMessageUrl
} from '@/lib/telegram';

import {GalleryItem} from '../../models/[document_id]/GalleryItem';
import {modelDetailPageClasses} from '../../models/[document_id]/page.styles';

export const dynamic = 'force-dynamic';

function formatIsoDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : value;
}

function asNullableUrl(value: string | null | undefined) {
  const text = (value ?? '').trim();
  return text || null;
}

type SocialLink = {
  key: string;
  label: string;
  url: string;
  iconPath: string;
  iconMode?: 'mask' | 'image';
};

export default async function InfluencerDetailPage({
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
    influencer_topic: string | null;
    influencer_platforms: string | null;
    influencer_instagram_url: string | null;
    influencer_youtube_url: string | null;
    influencer_tiktok_url: string | null;
    influencer_telegram_url: string | null;
    influencer_vk_url: string | null;
    influencer_yandex_music_url: string | null;
    influencer_spotify_url: string | null;
    updated_at: string;
  } | null = null;

  try {
    const supabase = createSupabasePublicClient();
    const {data, error: assetError} = await supabase
      .from('assets')
      .select(
        'id,document_id,title,description,license_type,influencer_topic,influencer_platforms,influencer_instagram_url,influencer_youtube_url,influencer_tiktok_url,influencer_telegram_url,influencer_vk_url,influencer_yandex_music_url,influencer_spotify_url,updated_at'
      )
      .eq('document_id', document_id)
      .eq('entity_type', 'influencer')
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
  const description = (asset.description || asset.title || '').trim() || '—';
  const topic = (asset.influencer_topic || '—').trim() || '—';
  const platforms = (asset.influencer_platforms || '—').trim() || '—';
  const socialLinks = [
    {
      key: 'instagram',
      label: tPublic('asset.instagram'),
      url: asNullableUrl(asset.influencer_instagram_url),
      iconPath: '/social/instagram.svg'
    },
    {
      key: 'youtube',
      label: tPublic('asset.youtube'),
      url: asNullableUrl(asset.influencer_youtube_url),
      iconPath: '/social/youtube.svg'
    },
    {
      key: 'tiktok',
      label: tPublic('asset.tiktok'),
      url: asNullableUrl(asset.influencer_tiktok_url),
      iconPath: '/social/tiktok.svg'
    },
    {
      key: 'telegram',
      label: tPublic('asset.telegram'),
      url: asNullableUrl(asset.influencer_telegram_url),
      iconPath: '/social/telegram.svg'
    },
    {
      key: 'vk',
      label: tPublic('asset.vk'),
      url: asNullableUrl(asset.influencer_vk_url),
      iconPath: '/social/vk.svg'
    },
    {
      key: 'yandexMusic',
      label: tPublic('asset.yandexMusic'),
      url: asNullableUrl(asset.influencer_yandex_music_url),
      iconPath: '/social/yandex-music.svg',
      iconMode: 'image'
    },
    {
      key: 'spotify',
      label: tPublic('asset.spotify'),
      url: asNullableUrl(asset.influencer_spotify_url),
      iconPath: '/social/spotify.svg'
    }
  ].filter((entry): entry is SocialLink => Boolean(entry.url));

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
          href="/influencers"
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
              {topic.toUpperCase()} · {license} · {timestamp}
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
                  {tPublic('asset.topic')}
                </div>
                <div className={modelDetailPageClasses.blockText}>
                  {topic}
                </div>
              </div>

              <div className={modelDetailPageClasses.block}>
                <div className={modelDetailPageClasses.blockTitle}>
                  {tPublic('asset.platforms')}
                </div>
                <div className={modelDetailPageClasses.blockText}>
                  {platforms}
                </div>
              </div>

              {socialLinks.length ? (
                <div className={modelDetailPageClasses.block}>
                  <div className={modelDetailPageClasses.blockTitle}>
                    {tPublic('detail.socialLinks')}
                  </div>
                  <div className={modelDetailPageClasses.socialLinksList}>
                    {socialLinks.map((entry) => (
                      <a
                        key={entry.key}
                        href={entry.url}
                        target="_blank"
                        rel="noreferrer"
                        className={
                          entry.iconMode === 'image'
                            ? `${modelDetailPageClasses.socialIconAnchor} ${modelDetailPageClasses.socialIconAnchorStatic}`
                            : modelDetailPageClasses.socialIconAnchor
                        }
                        aria-label={entry.label}
                        title={entry.label}
                      >
                        {entry.iconMode === 'image' ? (
                          <Image
                            src={entry.iconPath}
                            alt=""
                            width={24}
                            height={24}
                            aria-hidden
                            className={modelDetailPageClasses.socialIconImage}
                          />
                        ) : (
                          <span
                            aria-hidden
                            className={modelDetailPageClasses.socialIconGlyph}
                            style={{
                              WebkitMaskImage: `url(${entry.iconPath})`,
                              maskImage: `url(${entry.iconPath})`,
                              WebkitMaskPosition: 'center',
                              maskPosition: 'center',
                              WebkitMaskRepeat: 'no-repeat',
                              maskRepeat: 'no-repeat',
                              WebkitMaskSize: 'contain',
                              maskSize: 'contain'
                            }}
                          />
                        )}
                      </a>
                    ))}
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
}
