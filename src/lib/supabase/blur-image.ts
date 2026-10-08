import sharp from 'sharp';

/** A tiny preview only; the source image is never overwritten or recompressed. */
export async function createImageBlurDataURL(bytes: Uint8Array) {
  const preview = await sharp(bytes, {limitInputPixels: 50_000_000})
    .rotate()
    .resize({width: 20, height: 20, fit: 'inside', withoutEnlargement: true})
    .flatten({background: '#f4f4f4'})
    .jpeg({quality: 40})
    .toBuffer();
  return `data:image/jpeg;base64,${preview.toString('base64')}`;
}
