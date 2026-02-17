import type {AssetFieldKey, AssetListItem} from './types';

/**
 * Вытаскивает YYYY-MM-DD из ISO timestamp.
 * Используется в карточках/таблице каталога для компактного отображения дат.
 */
export function formatIsoDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : value;
}

function asUpper(value: string | null | undefined, fallback = '—') {
  const v = (value ?? '').trim();
  if (!v) return fallback;
  return v.toUpperCase();
}

/**
 * Возвращает строковое значение поля карточки/таблицы по ключу.
 * Ключи настраиваются на уровне страницы (models/creators/influencers).
 */
export function getAssetFieldValue(item: AssetListItem, key: AssetFieldKey) {
  switch (key) {
    case 'name':
      return item.title.trim() || item.document_id;
    case 'createdAt':
      return formatIsoDate(item.created_at);
    case 'license':
      return asUpper(item.license_type, 'STANDARD');
    case 'modelType':
      return asUpper(item.model_type);
    case 'direction':
      return asUpper(item.creator_direction);
    case 'status':
      return asUpper(item.status);
    case 'topic':
      return asUpper(item.influencer_topic);
    case 'platforms':
      return asUpper(item.influencer_platforms);
    default:
      return '—';
  }
}

export function getAssetDescription(item: AssetListItem) {
  return (item.description || item.title || '').trim() || '—';
}
