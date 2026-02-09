/**
 * Минимальный набор полей ассета, нужный для генерации Telegram-текстов.
 * Тип сделан "мягким", чтобы его могли передавать и публичные страницы, и админские формы.
 */
type AssetLike = {
  document_id: string;
  updated_at?: string | null;
  license_type?: string | null;
  status?: string | null;
  description?: string | null;
  category?: string | null;
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
 * Текст для универсальной CTA-кнопки на странице каталога, когда пользователь ещё не выбрал модель.
 * Используется в `/models` внизу страницы.
 */
export function buildGenericLicenseRequestText(): string {
  return ['LICENSE REQUEST', 'TYPE: GENERAL', 'SOURCE: /models'].join('\n');
}
