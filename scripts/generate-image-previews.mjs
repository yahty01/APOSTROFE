import {writeFile} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
import sharp from 'sharp';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('Set the existing public Supabase URL and key.');
const supabase = createClient(url, key, {auth: {persistSession: false, autoRefreshToken: false}});
const {data: media, error} = await supabase.from('asset_media').select('path');
if (error) throw error;
const paths = [...new Set((media ?? []).map((image) => image.path))].sort();
const {data: signed, error: signError} = await supabase.storage.from('assets').createSignedUrls(paths, 3600);
if (signError) throw signError;

const previews = {};
let index = 0;
await Promise.all(Array.from({length: 4}, async () => {
  while (index < signed.length) {
    const image = signed[index++];
    if (image.error || !image.signedUrl) throw new Error(`Cannot read ${image.path}`);
    const response = await fetch(image.signedUrl, {signal: AbortSignal.timeout(30_000)});
    if (!response.ok) throw new Error(`Cannot load ${image.path}: ${response.status}`);
    const bytes = await sharp(Buffer.from(await response.arrayBuffer()), {limitInputPixels: 50_000_000})
      .rotate()
      .resize({width: 20, height: 20, fit: 'inside', withoutEnlargement: true})
      .flatten({background: '#f4f4f4'})
      .jpeg({quality: 40})
      .toBuffer();
    previews[image.path] = `data:image/jpeg;base64,${bytes.toString('base64')}`;
    if (Object.keys(previews).length % 25 === 0) console.log(`Prepared ${Object.keys(previews).length}/${paths.length} previews`);
  }
}));
const ordered = Object.fromEntries(paths.map((path) => [path, previews[path]]));
const content = `${JSON.stringify(ordered, null, 2)}\n`;
await writeFile(new URL('../src/lib/supabase/image-previews.json', import.meta.url), content);
console.log(`Saved ${paths.length} previews (${Buffer.byteLength(content)} bytes); originals unchanged.`);
