import 'server-only';

import {createImageBlurDataURL} from './blur-image';
import imagePreviews from './image-previews.json';

const previews: Record<string, string> = imagePreviews;
const generated = new Map<string, {dataURL?: string; retryAfter: number}>();
const pending = new Set<string>();

/** Existing previews are inline; newly uploaded photos warm up in the background. */
export function getImageBlurDataURL(path: string, signedUrl: string) {
  if (previews[path]) return previews[path];
  const cached = generated.get(path);
  if (cached?.dataURL) return cached.dataURL;
  if (pending.size >= 2 || pending.has(path) || (cached && cached.retryAfter > Date.now())) {
    return undefined;
  }

  pending.add(path);
  generated.set(path, {retryAfter: Date.now() + 60_000});
  while (generated.size > 128) generated.delete(generated.keys().next().value!);
  // Never delay the HTML or the main image for optional preview generation.
  void fetch(signedUrl, {signal: AbortSignal.timeout(10_000)})
    .then(async (response) => {
      if (!response.ok) throw new Error('Image unavailable');
      return createImageBlurDataURL(new Uint8Array(await response.arrayBuffer()));
    })
    .then((dataURL) => {
      generated.set(path, {dataURL, retryAfter: Infinity});
      while (generated.size > 128) generated.delete(generated.keys().next().value!);
    })
    .catch(() => {})
    .finally(() => pending.delete(path));
  return undefined;
}
