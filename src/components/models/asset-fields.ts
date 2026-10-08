import {localizedAssetValue} from '@/lib/assets/localization';
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

function asUpper(value: string | null | undefined, locale: string, fallback = '—') {
  const v = (value ?? '').trim();
  if (!v) return localizedAssetValue(fallback, locale).toUpperCase();
  return localizedAssetValue(v, locale).toUpperCase();
}

/**
 * Возвращает строковое значение поля карточки/таблицы по ключу.
 * Ключи настраиваются на уровне страницы (models/creators/influencers).
 */
export function getAssetFieldValue(item: AssetListItem, key: AssetFieldKey, locale = 'ru') {
  switch (key) {
    case 'name':
      return item.title.trim() || item.document_id;
    case 'createdAt':
      return formatIsoDate(item.created_at);
    case 'license':
      return asUpper(item.license_type, locale, 'STANDARD');
    case 'modelType':
      return asUpper(item.model_type, locale);
    case 'direction':
      return asUpper(item.creator_direction, locale);
    case 'status':
      return asUpper(item.status, locale);
    case 'topic':
      return asUpper(item.influencer_topic, locale);
    case 'platforms':
      return asUpper(item.influencer_platforms, locale);
    default:
      return '—';
  }
}

export function getAssetDescription(item: AssetListItem) {
  return (item.description || item.title || '').trim() || '—';
}
