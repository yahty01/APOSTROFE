import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';
async function moduleFrom(path, replace = (text) => text) {
  const source = replace(await readFile(new URL(path, import.meta.url), 'utf8'));
  const js = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}}).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}
const seed = await readFile(new URL('../src/lib/assets/content-translations.json', import.meta.url), 'utf8');
const {localizeAsset, readAssetLocalization, writeAssetLocalization, assetTranslationFormValues, localizedAssetValue} = await moduleFrom('../src/lib/assets/localization.ts', (source) => source.replace("import contentTranslations from './content-translations.json';", `const contentTranslations = ${seed};`));
const {detectLocaleFromAcceptLanguage: detect} = await moduleFrom('../src/i18n/locale.ts');
assert.equal(detect('en-US,en;q=0.9,ru;q=0.5'), 'en');
assert.equal(detect('en;q=0.2,ru-RU;q=0.9'), 'ru');
assert.equal(detect('ru;q=0,en;q=1'), 'en');
assert.equal(detect('de,fr;q=0.8'), 'ru');
assert.equal(detect(null), 'ru');
assert.equal(detect('ru;q=oops,en;q=0.3'), 'en');
const base = {VK: 'https://vk.ru/person', age: 0, active: false, list: ['one', 'two'], nested: {height: 170}};
const english = {title: 'Person', description: 'English description', measurements: {height_cm: 170}, details: {Age: 0, Active: false}};
const stored = writeAssetLocalization(base, english);
assert.deepEqual(readAssetLocalization(stored), {base, en: english});
const asset = {document_id: 'model-person', title: 'Персонаж', description: 'Описание', details: stored, measurements: {Рост: 170}, model_type: 'GENERATIVE_MODEL'};
assert.equal(localizeAsset(asset, 'ru').title, 'Персонаж');
assert.equal(localizeAsset(asset, 'en').title, 'Person');
assert.deepEqual(localizeAsset(asset, 'ru').details, base);
assert.deepEqual(localizeAsset(asset, 'en').details, english.details);
assert.deepEqual(localizeAsset(asset, 'en').measurements, english.measurements);
assert.equal(asset.title, 'Персонаж');
assert.equal(assetTranslationFormValues(asset).title_en, 'Person');
assert.deepEqual(JSON.parse(assetTranslationFormValues(asset).details), base);
for (const legacy of [null, 0, false, ['legacy'], 'scalar', {__apostrofe_i18n: 'user content'}]) {
  const value = writeAssetLocalization(legacy, {title: 'Translated'});
  assert.deepEqual(readAssetLocalization(value).base, legacy);
}
const partial = {...asset, details: writeAssetLocalization(base, {title: '  '})};
assert.equal(localizeAsset(partial, 'en').title, 'Персонаж');
assert.equal(localizedAssetValue('READY', 'ru'), 'Готов');
assert.equal(localizedAssetValue('FULL_ACCESS', 'ru'), 'Полный доступ');
assert.equal(localizedAssetValue('Custom type', 'en'), 'Custom type');
const entries = JSON.parse(seed);
for (const [document_id, fields] of Object.entries(entries)) {
  const original = {document_id, ...Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.source]))};
  for (const [key, field] of Object.entries(fields)) {
    assert.deepEqual(localizeAsset(original, 'ru')[key], field.ru);
    assert.deepEqual(localizeAsset(original, 'en')[key], field.en ?? field.source);
    assert.deepEqual(assetTranslationFormValues(original)[`${key}_en`], field.en === undefined ? '' : typeof field.en === 'object' ? JSON.stringify(field.en, null, 2) : field.en);
  }
  if (fields.description) {
    const updated = {...original, description: 'Новое описание редактора'};
    assert.equal(localizeAsset(updated, 'ru').description, 'Новое описание редактора');
  }
}
console.log('PASS: locale priorities, bilingual data round trips, legacy values, source-aware translations and editor defaults');

const {localizedMarqueeText} = await moduleFrom('../src/lib/marquee-localization.ts');
const bilingual = 'WE CREATE PERSONALITIES. // МЫ СОЗДАЕМ ЛИЧНОСТИ. //';
assert.equal(localizedMarqueeText(bilingual, 'ru'), 'МЫ СОЗДАЁМ ЛИЧНОСТИ. //');
assert.equal(localizedMarqueeText(bilingual, 'en'), 'WE CREATE PERSONALITIES. //');
assert.equal(localizedMarqueeText('Custom text // Другой текст', 'ru'), 'Custom text // Другой текст');

assert.equal(localizedMarqueeText('We create personalities. // Мы создаем личности. //', 'ru'), 'МЫ СОЗДАЁМ ЛИЧНОСТИ. //');
