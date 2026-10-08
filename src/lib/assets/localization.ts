import contentTranslations from './content-translations.json';
import type {Json} from '@/lib/supabase/database.types';

const KEY = '__apostrofe_i18n';
export const translatedTextFields = ['title', 'description', 'model_type', 'creator_direction', 'influencer_topic', 'influencer_platforms', 'license_type', 'status'] as const;
export type AssetTranslation = Partial<Record<(typeof translatedTextFields)[number], string>> & {measurements?: Json | null; details?: Json | null};
function translatedJson(value: unknown) {
  if (value == null || value === '') return false;
  return typeof value !== 'object' || Object.keys(value).length > 0;
}
function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Store translations in the existing details JSON; no schema migration is needed. */
export function readAssetLocalization(details: unknown): {base: Json | null; en: AssetTranslation} {
  if (record(details) && record(details[KEY]) && details[KEY].version === 1 && record(details[KEY].en)) {
    const metadata = details[KEY];
    if (metadata.wrapped === true) return {base: (metadata.base ?? null) as Json, en: metadata.en as AssetTranslation};
    const base = {...details};
    delete base[KEY];
    return {base: base as Json, en: metadata.en as AssetTranslation};
  }
  return {base: (details ?? null) as Json, en: {}};
}

export function writeAssetLocalization(base: Json | null, en: AssetTranslation): Json | null {
  const cleaned: AssetTranslation = {};
  for (const key of translatedTextFields) {
    const value = typeof en[key] === 'string' ? en[key]!.trim() : '';
    if (value) cleaned[key] = value;
  }
  for (const key of ['measurements', 'details'] as const) {
    if (translatedJson(en[key])) cleaned[key] = en[key];
  }
  if (!Object.keys(cleaned).length) return base;
  if (record(base) && !(KEY in base)) return {...base, [KEY]: {version: 1, en: cleaned}} as Json;
  // Keep legacy scalar/array values (and a conflicting user key) intact.
  return {[KEY]: {version: 1, wrapped: true, base, en: cleaned}} as Json;
}

type SeedField = {source: unknown; ru: unknown; en?: unknown};
const seeds = contentTranslations as Record<string, Record<string, SeedField>>;
function matchingSeed(asset: {document_id?: string}, field: string, value: unknown) {
  const entry = seeds[asset.document_id ?? '']?.[field];
  return entry && JSON.stringify(entry.source) === JSON.stringify(value) ? entry : null;
}
export function localizeAsset<T extends {details?: unknown; document_id?: string}>(asset: T, locale: string): T {
  const {base, en} = readAssetLocalization(asset.details);
  const result = {...asset, details: base} as T;
  for (const field of ['title', 'description', 'measurements', 'details']) {
    const value = (result as Record<string, unknown>)[field];
    const seed = matchingSeed(asset, field, value);
    if (seed && (locale !== 'en' || seed.en !== undefined)) Object.assign(result, {[field]: seed[locale === 'en' ? 'en' : 'ru']});
  }
  if (locale !== 'en') return result;
  for (const key of translatedTextFields) {
    if (typeof en[key] === 'string' && en[key]!.trim()) Object.assign(result, {[key]: en[key]});
  }
  for (const key of ['measurements', 'details'] as const) {
    if (translatedJson(en[key])) Object.assign(result, {[key]: en[key]});
  }
  return result;
}

/** Existing English source copy is preserved when Russian translations are first saved. */
export function assetTranslationFormValues(asset: {details?: unknown; document_id?: string}) {
  const ru = localizeAsset(asset, 'ru') as Record<string, unknown>;
  const saved = readAssetLocalization(asset.details).en;
  const english: AssetTranslation = {...saved};
  for (const key of [...translatedTextFields, 'measurements', 'details'] as const) {
    const source = key === 'details' ? readAssetLocalization(asset.details).base : (asset as Record<string, unknown>)[key];
    const seed = matchingSeed(asset, key, source);
    if (seed && seed.en !== undefined && english[key] == null) Object.assign(english, {[key]: seed.en});
  }
  return Object.fromEntries([
    ...translatedTextFields.map((key) => [key, ru[key] ?? '']),
    ...translatedTextFields.map((key) => [`${key}_en`, english[key] ?? '']),
    ...(['measurements', 'details'] as const).flatMap((key) => [
      [key, ru[key] == null ? '' : JSON.stringify(ru[key], null, 2)],
      [`${key}_en`, english[key] == null ? '' : JSON.stringify(english[key], null, 2)]
    ])
  ]);
}

const knownValues: Record<string, [string, string]> = {
  STANDARD: ['Стандартная', 'Standard'], READY: ['Готов', 'Ready'], DRAFT: ['Черновик', 'Draft'],
  AVAILABLE: ['Доступен', 'Available'], ACTIVE: ['Активен', 'Active'], GENERATIVE_MODEL: ['Генеративная модель', 'Generative model'],
  AI_MODEL: ['ИИ-модель', 'AI model'], AVATAR: ['Аватар', 'Avatar'], DIGITAL_MODEL: ['Цифровая модель', 'Digital model'],
  NPC: ['Неигровой персонаж', 'NPC'], MUSIC: ['Музыка', 'Music'], FASHION: ['Мода', 'Fashion'],
  DESIGN: ['Дизайн', 'Design'], SPORT: ['Спорт', 'Sport'], LIFESTYLE: ['Образ жизни', 'Lifestyle'],
  FULL_ACCESS: ['Полный доступ', 'Full access'], WORK: ['В работе', 'Working'],
  'PRODUCTION AND ANIMATION': ['Производство и анимация', 'Production and animation'],
  'ROYALTY FREE': ['Без лицензионных отчислений', 'Royalty free']
};
export function localizedAssetValue(value: string | null | undefined, locale: string, fallback = '—'): string {
  const text = value?.trim() || fallback;
  return knownValues[text.toUpperCase()]?.[locale === 'ru' ? 0 : 1] ?? text;
}
