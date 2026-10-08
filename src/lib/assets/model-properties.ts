export const socialPlatforms = [
  {key: 'instagram', label: 'Instagram', aliases: ['instagram', 'инстаграм']},
  {key: 'youtube', label: 'YouTube', aliases: ['youtube', 'ютуб']},
  {key: 'tiktok', label: 'TikTok', aliases: ['tiktok', 'тикток']},
  {key: 'telegram', label: 'Telegram', aliases: ['telegram', 'телеграм', 'tg']},
  {key: 'vk', label: 'VK', aliases: ['vk', 'вк', 'вконтакте']},
  {key: 'likee', label: 'Likee', aliases: ['likee']},
  {key: 'yandex-music', label: 'Yandex Music', aliases: ['yandexmusic', 'яндексмузыка']},
  {key: 'spotify', label: 'Spotify', aliases: ['spotify']}
] as const;

export type SocialPlatform = (typeof socialPlatforms)[number];
export type SocialLink = {key: SocialPlatform['key']; label: string; url: string};

export function httpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function socialPlatformForKey(key: string) {
  const normalized = key.toLowerCase().replace(/(?:influencer|url)|[^a-zа-яё0-9]/g, '');
  return socialPlatforms.find((platform) =>
    (platform.aliases as readonly string[]).includes(normalized)
  );
}

export function isPropertyObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Read the existing JSON links without changing or migrating stored records. */
export function splitModelDetails(value: unknown) {
  const links: SocialLink[] = [];
  const properties: Record<string, unknown> = {};
  if (!isPropertyObject(value)) return {links, properties: value};
  for (const [key, entry] of Object.entries(value)) {
    const platform = socialPlatformForKey(key);
    const url = platform ? httpUrl(entry) : null;
    if (platform && url) {
      if (!links.some((link) => link.key === platform.key && link.url === url)) {
        links.push({key: platform.key, label: platform.label, url});
      }
    } else {
      properties[key] = entry;
    }
  }
  links.sort((a, b) => socialPlatforms.findIndex((p) => p.key === a.key) - socialPlatforms.findIndex((p) => p.key === b.key));
  return {links, properties};
}

export function hasProperties(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

const labels: Record<string, [string, string]> = {
  eyes: ['Глаза', 'Eyes'], hair: ['Волосы', 'Hair'], build: ['Телосложение', 'Build'],
  height_cm: ['Рост, см', 'Height, cm'], age: ['Возраст', 'Age'], city: ['Город', 'City'],
  roles: ['Род деятельности', 'Roles'], topics: ['Тематики', 'Topics'],
  formats: ['Форматы', 'Formats'], audience: ['Аудитория', 'Audience']
};

export function propertyLabel(key: string, locale: string) {
  return labels[key]?.[locale === 'ru' ? 0 : 1] ?? key.replace(/_/g, ' ');
}

/** Flatten nested objects while keeping every value, including arrays, zero and false. */
export function propertyRows(value: unknown, locale: string, prefix = ''): {label: string; value: string}[] {
  if (!hasProperties(value)) return [];
  if (Array.isArray(value)) {
    if (value.every((entry) => entry === null || typeof entry !== 'object')) {
      return [{label: prefix, value: value.map((entry) => primitiveText(entry, locale)).join(' · ')}];
    }
    return value.flatMap((entry, index) => propertyRows(entry, locale, `${prefix} ${index + 1}`.trim()));
  }
  if (isPropertyObject(value)) {
    return Object.entries(value).flatMap(([key, entry]) => {
      const label = [prefix, propertyLabel(key, locale)].filter(Boolean).join(' / ');
      return hasProperties(entry) ? propertyRows(entry, locale, label) : [{label, value: '—'}];
    });
  }
  return [{label: prefix, value: primitiveText(value, locale)}];
}

function primitiveText(value: unknown, locale: string) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? (locale === 'ru' ? 'Да' : 'Yes') : (locale === 'ru' ? 'Нет' : 'No');
  return String(value);
}
