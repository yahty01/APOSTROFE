import type {AssetEntityType} from '@/lib/assets/entity';

const TELEGRAM_LICENSE_USERNAME = 'apostrofe_license';

/**
 * Минимальный набор полей ассета, нужный для генерации Telegram-текстов.
 * Тип сделан "мягким", чтобы его могли передавать и публичные страницы, и админские формы.
 */
type AssetLike = {
  document_id: string;
  created_at?: string | null;
  updated_at?: string | null;
  license_type?: string | null;
  status?: string | null;
  description?: string | null;
  category?: string | null;
  model_type?: string | null;
  creator_direction?: string | null;
  influencer_topic?: string | null;
  influencer_platforms?: string | null;
  title?: string | null;
};

/**
 * Приводит ISO timestamp к читабельной дате (YYYY-MM-DD) без зависимости от таймзоны/локали.
 * Используется в Telegram-текстах, чтобы сообщения были компактными и воспроизводимыми.
 */
function formatIsoDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : value;
}

function asUpper(value: string | null | undefined, fallback = '—') {
  const v = (value ?? '').trim();
  if (!v) return fallback;
  return v.toUpperCase();
}

function buildAssetInfo(asset: Pick<AssetLike, 'document_id' | 'title'>) {
  const title = (asset.title || '').trim();
  const documentId = (asset.document_id || '').trim();
  if (title && documentId && title !== documentId) return `${title} (${documentId})`;
  return title || documentId || '—';
}

/**
 * Строит ссылку `t.me/share/url`, которая открывает Telegram-share с предзаполненным текстом.
 * Используется в публичном каталоге и карточках моделей как CTA на запрос лицензии/инфо.
 */
export function buildTelegramShareUrl(text: string, url?: string): string {
  const params = new URLSearchParams();
  params.set('text', text);
  if (url) params.set('url', url);
  return `https://t.me/share/url?${params.toString()}`;
}

/**
 * Строит deep-link в чат Telegram (`@apostrofe_license`) с предзаполненным текстом.
 */
export function buildTelegramDirectMessageUrl(
  text: string,
  username = TELEGRAM_LICENSE_USERNAME
): string {
  const cleanUsername = username.replace(/^@/, '').trim() || TELEGRAM_LICENSE_USERNAME;
  const params = new URLSearchParams();
  params.set('text', text);
  return `https://t.me/${cleanUsername}?${params.toString()}`;
}

export function buildAssetLicenseInquiryText(
  asset: Pick<AssetLike, 'document_id' | 'title'>
): string {
  return `Хочу запросить у вас лицензию на данный актив: "${buildAssetInfo(asset)}"`;
}

export function buildAssetInfoInquiryText(
  asset: Pick<AssetLike, 'document_id' | 'title'>
): string {
  return `Хочу запросить у вас информацию о данном активе: "${buildAssetInfo(asset)}"`;
}

export function buildCreatorCollaborateText(creatorName: string): string {
  const name = creatorName.trim() || 'креатором';
  return `Хочу сотрудничать с ${name}`;
}

export function buildCreatorDealmemoRequestText(): string {
  return 'Хочу запросить у вас DEALMEMO';
}

export function buildCollaborateWithUsText(): string {
  return 'Хочу сотрудничать с вами';
}

/**
 * Формирует многострочный текст запроса лицензии для конкретного ассета.
 * Используется в `AssetCards`, `ModelDetailPage` и других CTA, чтобы упростить коммуникацию в Telegram.
 */
export function buildLicenseRequestText(asset: AssetLike): string {
  const description = (asset.description || asset.title || '').trim() || '—';

  const lines: (string | null)[] = [
    'LICENSE REQUEST',
    `DOCUMENT_ID: ${asset.document_id}`,
    `TIMESTAMP: ${formatIsoDate(asset.updated_at)}`,
    `LICENSE: ${(asset.license_type || 'STANDARD').toUpperCase()}`,
    `STATUS: ${(asset.status || 'AVAILABLE').toUpperCase()}`,
    `DESCRIPTION: ${description}`,
    asset.category ? `CATEGORY: ${asset.category}` : null,
    asset.title ? `TITLE: ${asset.title}` : null
  ];

  return lines.filter(Boolean).join('\n');
}

/**
 * Формирует короткий текст "REQUEST INFO" для конкретного ассета.
 * Используется в карточке модели (`/models/[document_id]`) для запроса доп. информации.
 */
export function buildRequestInfoText(asset: AssetLike): string {
  const lines: (string | null)[] = [
    'REQUEST INFO',
    `DOCUMENT_ID: ${asset.document_id}`,
    `TIMESTAMP: ${formatIsoDate(asset.updated_at)}`,
    `LICENSE: ${(asset.license_type || 'STANDARD').toUpperCase()}`,
    `STATUS: ${(asset.status || 'AVAILABLE').toUpperCase()}`
  ];

  return lines.filter(Boolean).join('\n');
}

/**
 * Формирует текст запроса лицензии для карточек public registry (`models/creators/influencers`).
 * Поля подбираются по типу сущности, чтобы пользователю и оператору было проще сверить запрос.
 */
export function buildEntityLicenseRequestText(
  asset: AssetLike,
  entityType: AssetEntityType
): string {
  const description = (asset.description || asset.title || '').trim() || '—';
  const date = formatIsoDate(asset.created_at ?? asset.updated_at);
  const license = asUpper(asset.license_type, 'STANDARD');
  const name = (asset.title || asset.document_id || '').trim() || asset.document_id;

  if (entityType === 'creator') {
    return [
      'LICENSE REQUEST',
      'ENTITY: CREATOR',
      `NAME: ${name}`,
      `DATE: ${date}`,
      `DIRECTION: ${asUpper(asset.creator_direction)}`,
      `LICENSE: ${license}`,
      `STATUS: ${asUpper(asset.status)}`,
      `DESCRIPTION: ${description}`,
      `DOCUMENT_ID: ${asset.document_id}`
    ].join('\n');
  }

  if (entityType === 'influencer') {
    return [
      'LICENSE REQUEST',
      'ENTITY: INFLUENCER',
      `NAME: ${name}`,
      `DATE: ${date}`,
      `TOPIC: ${asUpper(asset.influencer_topic)}`,
      `LICENSE: ${license}`,
      `PLATFORMS: ${asUpper(asset.influencer_platforms)}`,
      `DESCRIPTION: ${description}`,
      `DOCUMENT_ID: ${asset.document_id}`
    ].join('\n');
  }

  return [
    'LICENSE REQUEST',
    'ENTITY: MODEL',
    `NAME: ${name}`,
    `DATE: ${date}`,
    `TYPE: ${asUpper(asset.model_type ?? asset.category)}`,
    `LICENSE: ${license}`,
    `DESCRIPTION: ${description}`,
    `DOCUMENT_ID: ${asset.document_id}`
  ].join('\n');
}

/**
 * Текст для универсальной CTA-кнопки на странице каталога, когда пользователь ещё не выбрал модель.
 * Используется в `/models` внизу страницы.
 */
export function buildGenericLicenseRequestText(source = '/models'): string {
  return ['LICENSE REQUEST', 'TYPE: GENERAL', `SOURCE: ${source}`].join('\n');
}
