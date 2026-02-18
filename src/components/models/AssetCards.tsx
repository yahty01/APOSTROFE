import Image from 'next/image';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

import {
  buildAssetLicenseInquiryText,
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

  return (
    <div className={assetCardsClasses.root}>
      <div className={assetCardsClasses.grid}>
        {items.map((item) => {
          const description = getAssetDescription(item);
          const cardHref = detailBasePath
            ? `${detailBasePath}/${encodeURIComponent(item.document_id)}`
            : null;

          const telegramHref = buildTelegramDirectMessageUrl(
            buildAssetLicenseInquiryText(item)
          );

          const mediaContent =
            mediaMode === 'title' ? (
              <div className={assetCardsClasses.mediaTitle}>
                {getAssetFieldValue(item, 'name')}
              </div>
            ) : item.preview_url ? (
              <Image
                src={item.preview_url}
                alt={item.title}
                fill
                className={assetCardsClasses.mediaImage}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            ) : entityType === 'creator' ? (
              <div className={assetCardsClasses.mediaTitle}>
                {getAssetFieldValue(item, 'name')}
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
                        {getAssetFieldValue(item, field)}
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
                  {t('cta.requestLicense')}
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
