/** Split only the legacy bilingual default; preserve all text entered by editors. */
export function localizedMarqueeText(text: string, locale: string) {
  const parts = text.split('//').map((part) => part.trim()).filter(Boolean);
  const legacy = parts.length > 1 && parts.every((part) => ['WE CREATE PERSONALITIES.', 'МЫ СОЗДАЕМ ЛИЧНОСТИ.'].includes(part.toUpperCase().replace(/Ё/g, 'Е')));
  return legacy ? (locale === 'ru' ? 'МЫ СОЗДАЁМ ЛИЧНОСТИ. //' : 'WE CREATE PERSONALITIES. //') : text;
}
