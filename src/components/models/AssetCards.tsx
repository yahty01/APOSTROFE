import Image from 'next/image';
import Link from 'next/link';
import {getLocale, getTranslations} from 'next-intl/server';

import {
  buildAssetLicenseInquiryText,
  buildCreatorCollaborateText,
  buildTelegramDirectMessageUrl
} from '@/lib/telegram';

import {getAssetDescription, getAssetFieldValue} from './asset-fields';
import {assetCardsClasses} from './AssetCards.styles';
import type {
  AssetEntityType,
  AssetFieldKey,
  AssetListItem,
  AssetMediaMode
} from './types';

export async function AssetCards({
  items,
  fields,
  entityType,
  mediaMode = 'image',
  detailBasePath
}: {
  items: AssetListItem[];
  fields: AssetFieldKey[];
  entityType: AssetEntityType;
  mediaMode?: AssetMediaMode;
  detailBasePath?: string;
}) {
  const t = await getTranslations('public');
  const locale = await getLocale();

  return (
    <div className={assetCardsClasses.root}>
      <div className={assetCardsClasses.grid}>
        {items.map((item, index) => {
          const description = getAssetDescription(item);
          const cardHref = detailBasePath
            ? `${detailBasePath}/${encodeURIComponent(item.document_id)}`
            : null;

          const telegramHref =
            entityType === 'creator'
              ? buildTelegramDirectMessageUrl(
                  buildCreatorCollaborateText(
                    (item.title || item.document_id).trim() || item.document_id, locale
                  )
                )
              : buildTelegramDirectMessageUrl(buildAssetLicenseInquiryText(item, locale));

          const ctaLabel =
            entityType === 'creator'
              ? t('cta.creatorCollaborate')
              : t('cta.requestLicense');

          const mediaContent =
            mediaMode === 'title' ? (
              <div className={assetCardsClasses.mediaTitle}>
                {getAssetFieldValue(item, 'name', locale)}
              </div>
            ) : item.preview_url ? (
              <Image
                src={item.preview_url}
                placeholder={item.preview_blur_data_url ? 'blur' : 'empty'}
                blurDataURL={item.preview_blur_data_url}
                alt={item.title}
                fill
                className={assetCardsClasses.mediaImage}
                style={{objectFit: 'contain', objectPosition: 'center'}}
                sizes="(max-width: 639px) calc(100vw - 34px), (max-width: 767px) calc(50vw - 25px), (max-width: 1279px) calc(33.333vw - 28px), (max-width: 2399px) calc(25vw - 26px), 574px"
                preload={index === 0}
                fetchPriority={index < 4 ? 'high' : undefined}
              />
            ) : entityType === 'creator' ? (
              <div className={assetCardsClasses.mediaTitle}>
                {getAssetFieldValue(item, 'name', locale)}
              </div>
            ) : (
              <div className={assetCardsClasses.mediaFallback}>
                {t('asset.noImage')}
              </div>
            );

          return (
            <article
              key={item.id}
              className={assetCardsClasses.card}
            >
              {cardHref ? (
                <Link href={cardHref} className={assetCardsClasses.mediaLink}>
                  {mediaContent}
                </Link>
              ) : (
                <div className={assetCardsClasses.mediaLink}>{mediaContent}</div>
              )}

              <div className={assetCardsClasses.body}>
                <div className={assetCardsClasses.table}>
                  {fields.map((field) => (
                    <div key={`${item.id}-${field}`} className={assetCardsClasses.row}>
                      <div className={assetCardsClasses.rowKey}>
                        {t(`asset.${field}`)}
                      </div>
                      <div className={assetCardsClasses.rowValue}>
                        {getAssetFieldValue(item, field, locale)}
                      </div>
                    </div>
                  ))}
                  <div className={assetCardsClasses.description}>
                    <div className={assetCardsClasses.descriptionLabel}>
                      {t('asset.description')}
                    </div>
                    <div className={assetCardsClasses.descriptionValue}>
                      {description}
                    </div>
                  </div>
                </div>

                <a
                  href={telegramHref}
                  target="_blank"
                  rel="noreferrer"
                  className={assetCardsClasses.cta}
                >
                  {`[ ${ctaLabel} ]`}
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
