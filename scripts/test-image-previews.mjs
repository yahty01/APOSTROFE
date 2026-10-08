import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import sharp from 'sharp';
import ts from 'typescript';

const previews = JSON.parse(await readFile(new URL('../src/lib/supabase/image-previews.json', import.meta.url), 'utf8'));
assert(Object.keys(previews).length > 0);
for (const [path, dataURL] of Object.entries(previews)) {
  assert(path && !path.includes('..'));
  assert(dataURL.startsWith('data:image/jpeg;base64,'));
  const buffer = Buffer.from(dataURL.split(',')[1], 'base64');
  assert(buffer.length < 1500, `Oversized preview: ${path}`);
  const meta = await sharp(buffer).metadata();
  assert.equal(meta.format, 'jpeg');
  assert(meta.width > 0 && meta.width <= 20);
  assert(meta.height > 0 && meta.height <= 20);
}

const require = createRequire(import.meta.url);
const source = (await readFile(new URL('../src/lib/supabase/blur-image.ts', import.meta.url), 'utf8'))
  .replace("'sharp'", JSON.stringify(pathToFileURL(require.resolve('sharp')).href));
const {outputText} = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}});
const {createImageBlurDataURL} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const original = await sharp({create: {width: 40, height: 80, channels: 3, background: '#98613b'}}).jpeg({quality: 95}).toBuffer();
const unchanged = Buffer.from(original);
const preview = await createImageBlurDataURL(original);
assert.deepEqual(original, unchanged);
const meta = await sharp(Buffer.from(preview.split(',')[1], 'base64')).metadata();
assert.equal(meta.width, 10);
assert.equal(meta.height, 20);
console.log(`PASS: ${Object.keys(previews).length} tiny previews, portrait proportions and unchanged originals`);
