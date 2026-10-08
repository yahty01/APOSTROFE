import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/assets/model-properties.ts', import.meta.url), 'utf8');
const localization = await readFile(new URL('../src/lib/assets/localization.ts', import.meta.url), 'utf8');
const seed = await readFile(new URL('../src/lib/assets/content-translations.json', import.meta.url), 'utf8');
const localizedSource = localization.replace("import contentTranslations from './content-translations.json';", `const contentTranslations = ${seed};`);
const localizedJS = ts.transpileModule(localizedSource, {compilerOptions: {module: ts.ModuleKind.ESNext}}).outputText;
const localizationURL = `data:text/javascript;base64,${Buffer.from(localizedJS).toString('base64')}`;
const {outputText} = ts.transpileModule(source.replace("'./localization'", JSON.stringify(localizationURL)), {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}});
const {httpUrl, splitModelDetails, propertyRows, socialPlatformForKey, hasProperties} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

for (const url of ['javascript:alert(1)', 'data:text/html,test', '/relative', 'https://user:pass@example.com', 'not a url']) {
  assert.equal(httpUrl(url), null);
}
assert.equal(httpUrl(' https://vk.ru/person '), 'https://vk.ru/person');
assert.equal(socialPlatformForKey('ВКонтакте').key, 'vk');
assert.equal(socialPlatformForKey('influencer_yandex_music_url').key, 'yandex-music');
assert.equal(socialPlatformForKey('Платформы'), undefined);

const original = {age: 0, flags: {active: false}, roles: ['creator', 'streamer'], VK: 'https://vk.ru/person', Instagram: 'javascript:alert(1)', custom: 'Keep me'};
const {links, properties} = splitModelDetails(original);
assert.equal(links.length, 1);
assert.equal(links[0].key, 'vk');
assert.deepEqual({...properties, VK: links[0].url}, original);
assert.deepEqual(splitModelDetails(original), {links, properties});
const rows = propertyRows(properties, 'ru');
assert(rows.some((row) => row.label === 'Возраст' && row.value === '0'));
assert(rows.some((row) => row.label === 'flags / active' && row.value === 'Нет'));
assert(rows.some((row) => row.value === 'creator · streamer'));
assert(rows.some((row) => row.value === 'javascript:alert(1)'));
assert(rows.some((row) => row.label === 'custom' && row.value === 'Keep me'));
assert.deepEqual(propertyRows([{name: 'One'}, {name: 'Two'}], 'en').map((row) => row.value), ['One', 'Two']);
assert.equal(splitModelDetails({VK: 'https://vk.ru/a', ВКонтакте: 'https://vk.ru/a'}).links.length, 1);
for (const empty of [null, undefined, '', {}, []]) assert.equal(hasProperties(empty), false);
for (const value of [0, false]) assert.equal(hasProperties(value), true);
console.log('PASS: model property rendering, legacy social aliases, safe links and preservation of values');
