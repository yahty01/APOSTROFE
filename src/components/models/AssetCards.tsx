import Image from 'next/image';
import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

import {buildLicenseRequestText, buildTelegramShareUrl} from '@/lib/telegram';

import type {AssetListItem} from './types';
import {assetCardsClasses} from './AssetCards.styles';

/**
 * Вытаскивает YYYY-MM-DD из ISO-строки, чтобы отображение было компактным и одинаковым в UI.
 * Используется в карточках (и повторяется в таблице) для отображения `updated_at`.
 */
function formatIsoDate(value: string) {
  if (!value) return '—';
  const d = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : value;
}

/**
 * Карточный вид каталога моделей.
 * Используется на `/models` при `view=cards`: показывает превью, краткие метаданные и CTA на запрос лицензии.
 */
export async function AssetCards({items}: {items: AssetListItem[]}) {
  const t = await getTranslations('public');

  return (
    <div className={assetCardsClasses.root}>
      <div className={assetCardsClasses.grid}>
        {items.map((item) => {
          const timestamp = formatIsoDate(item.updated_at);
          const license = (item.license_type || 'STANDARD').toUpperCase();
          const status = (item.status || 'AVAILABLE').toUpperCase();
          const description = (item.description || item.title || '').trim();

          const telegramHref = buildTelegramShareUrl(buildLicenseRequestText(item));

          return (
            <article
              key={item.id}
              className={assetCardsClasses.card}
            >
              <Link
                href={`/models/${encodeURIComponent(item.document_id)}`}
                className={assetCardsClasses.mediaLink}
              >
                {item.preview_url ? (
                  <Image
                    src={item.preview_url}
                    alt={item.title}
                    fill
                    className={assetCardsClasses.mediaImage}
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className={assetCardsClasses.mediaFallback}>
                    {t('asset.noImage')}
                  </div>
                )}
              </Link>

              <div className={assetCardsClasses.body}>
                <div className={assetCardsClasses.table}>
                  <div className={assetCardsClasses.row}>
                    <div className={assetCardsClasses.rowKey}>
                      {t('asset.documentId')}
                    </div>
                    <div className={assetCardsClasses.rowValue}>{item.document_id}</div>
                  </div>
                  <div className={assetCardsClasses.row}>
                    <div className={assetCardsClasses.rowKey}>
                      {t('asset.timestamp')}
                    </div>
                    <div className={assetCardsClasses.rowValue}>{timestamp}</div>
                  </div>
                  <div className={assetCardsClasses.row}>
                    <div className={assetCardsClasses.rowKey}>
                      {t('asset.license')}
                    </div>
                    <div className={assetCardsClasses.rowValue}>{license}</div>
                  </div>
                  <div className={assetCardsClasses.row}>
                    <div className={assetCardsClasses.rowKey}>
                      {t('asset.status')}
                    </div>
                    <div className={assetCardsClasses.rowValue}>{status}</div>
                  </div>
                  <div className={assetCardsClasses.description}>
                    <div className={assetCardsClasses.descriptionLabel}>
                      {t('asset.description')}
                    </div>
                    <div className={assetCardsClasses.descriptionValue}>
                      {description || '—'}
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
