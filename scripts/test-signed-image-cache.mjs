import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile(new URL('../src/lib/supabase/signed-image-cache.ts', import.meta.url), 'utf8');
const {outputText} = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}});
const {createSignedImageCache} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

let time = 1_000_000;
const calls = [];
const getUrls = createSignedImageCache({
  now: () => time,
  sign: async (paths) => {
    calls.push(paths);
    return paths.map((path) => ({path, url: `${path}?signature=${calls.length}`, expiresAt: time + 3_600_000}));
  }
});

const [first, overlapping] = await Promise.all([
  getUrls(['hero', 'catalog', 'hero']),
  getUrls(['catalog', 'gallery'])
]);
assert.equal(calls.flat().filter((path) => path === 'catalog').length, 1);
assert.equal(first.get('catalog'), overlapping.get('catalog'));
assert.equal(first.size, 2);
assert.deepEqual(await getUrls([]), new Map());
const callCount = calls.length;
time += 44 * 60_000;
assert.equal((await getUrls(['hero'])).get('hero'), first.get('hero'));
assert.equal(calls.length, callCount);
time += 2 * 60_000;
assert.notEqual((await getUrls(['hero'])).get('hero'), first.get('hero'));
assert.equal(calls.length, callCount + 1);
time += 24 * 3_600_000;
const refreshedAfterIdle = (await getUrls(['catalog'])).get('catalog');
assert.notEqual(refreshedAfterIdle, first.get('catalog'));

let attempts = 0;
const retry = createSignedImageCache({
  now: () => time,
  sign: async (paths) => {
    attempts++;
    if (attempts === 1) throw new Error('Storage unavailable');
    return paths.filter((path) => path !== 'denied').map((path) => ({path, url: path, expiresAt: time + 3_600_000}));
  }
});
assert.equal((await retry(['allowed'])).get('allowed'), null);
assert.equal((await retry(['allowed', 'denied'])).get('allowed'), 'allowed');
assert.equal((await retry(['denied'])).get('denied'), null);
assert.equal(attempts, 3); // Denied/missing files and errors must not be cached.

let shortCalls = 0;
const shortLived = createSignedImageCache({
  now: () => time,
  sign: async (paths) => paths.map((path) => ({path, url: `short-${++shortCalls}`, expiresAt: time + 90_000}))
});
const shortUrl = (await shortLived(['photo'])).get('photo');
time += 31_000;
assert.notEqual((await shortLived(['photo'])).get('photo'), shortUrl);
const expired = createSignedImageCache({now: () => time, sign: async () => [{path: 'photo', url: 'expired', expiresAt: time}]});
assert.equal((await expired(['photo'])).get('photo'), null);

const boundedCalls = [];
const bounded = createSignedImageCache({
  now: () => time,
  maxEntries: 2,
  sign: async (paths) => {
    boundedCalls.push(...paths);
    return paths.map((path) => ({path, url: path, expiresAt: time + 3_600_000}));
  }
});
await bounded(['a', 'b']);
await bounded(['a']);
await bounded(['c']);
await bounded(['a']);
await bounded(['b']);
assert.deepEqual(boundedCalls, ['a', 'b', 'c', 'b']);
console.log('PASS: batched signatures, concurrent requests, reuse, expiry/idle refresh, uncached failures and bounded memory');
