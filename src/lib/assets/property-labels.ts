export const propertyLabels: Record<string, [string, string]> = {
  eyes: ['Глаза', 'Eyes'], hair: ['Волосы', 'Hair'], build: ['Телосложение', 'Build'],
  height_cm: ['Рост, см', 'Height, cm'], age: ['Возраст', 'Age'], city: ['Город', 'City'],
  roles: ['Род деятельности', 'Roles'], topics: ['Тематики', 'Topics'],
  formats: ['Форматы', 'Formats'], audience: ['Аудитория', 'Audience'],
  style: ['Стиль', 'Style'], name: ['Имя', 'Name'], era: ['Эпоха', 'Era'], character: ['Характер', 'Personality'],
  beard: ['Борода', 'Beard'], geography: ['География', 'Geography'], languages: ['Языки', 'Languages'],
  height: ['Рост', 'Height'], clothing: ['Одежда', 'Clothing'], weight: ['Вес', 'Weight']
};

function normalizedKey(key: string) {return key.trim().toLowerCase().replace(/_/g, ' ');}

/** Match known Russian/English labels without guessing translations of custom names. */
export function propertyKey(key: string) {
  const normalized = normalizedKey(key);
  return Object.entries(propertyLabels).find(([canonical, names]) =>
    [canonical, ...names].some((name) => normalizedKey(name) === normalized)
  )?.[0] ?? normalized;
}
