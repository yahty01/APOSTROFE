import 'server-only';

import {createSupabasePublicClient} from './public';
import {createSignedImageCache} from './signed-image-cache';
import {getImageBlurDataURL} from './image-previews';

export type PublicImage = {url: string; blurDataURL?: string};

// Cache only anonymous, RLS-authorized URLs. Admin previews use images.ts and
// never enter this shared cache. Signatures retain their existing one-hour life.
const createPublicImageUrls = createSignedImageCache({
  sign: async (paths) => {
    const supabase = createSupabasePublicClient();
    const {data, error} = await supabase.storage.from('assets').createSignedUrls(paths, 60 * 60);
    if (error || !data) return [];

    return data.flatMap((image) => {
      if (image.error || !image.path || !image.signedUrl) return [];
      try {
        const token = new URL(image.signedUrl).searchParams.get('token');
        const claims = JSON.parse(Buffer.from(token!.split('.')[1], 'base64url').toString());
        if (typeof claims.exp !== 'number' || !Number.isFinite(claims.exp)) return [];
        return [{path: image.path, url: image.signedUrl, expiresAt: claims.exp * 1000}];
      } catch {
        return [];
      }
    });
  }
});

/** Inline previews arrive with the HTML, before the full-size image request. */
export async function createPublicImages(paths: string[]): Promise<Map<string, PublicImage | null>> {
  const urls = await createPublicImageUrls(paths);
  return new Map([...urls].map(([path, url]) => [
    path,
    url ? {url, blurDataURL: getImageBlurDataURL(path, url)} : null
  ]));
}
