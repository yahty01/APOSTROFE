export type SignedImage = {
  path: string;
  url: string;
  expiresAt: number;
};

type CacheEntry = {url: string; refreshAt: number};

/** Reuse signatures so Next's image cache can reuse the processed original. */
export function createSignedImageCache({
  sign,
  now = Date.now,
  maxEntries = 512
}: {
  sign: (paths: string[]) => Promise<SignedImage[]>;
  now?: () => number;
  maxEntries?: number;
}) {
  const entries = new Map<string, CacheEntry>();
  const pending = new Map<string, Promise<string | null>>();
  const reuseFor = 45 * 60 * 1000;
  const expiryMargin = 60 * 1000;

  return async function getUrls(paths: string[]) {
    const uniquePaths = [...new Set(paths.filter(Boolean))];
    const urls = new Map<string, string | null>();
    const missing: string[] = [];

    for (const path of uniquePaths) {
      const entry = entries.get(path);
      if (entry && entry.refreshAt > now()) {
        // Keep frequently viewed images when the bounded cache fills up.
        entries.delete(path);
        entries.set(path, entry);
        urls.set(path, entry.url);
      } else {
        entries.delete(path);
        if (!pending.has(path)) missing.push(path);
      }
    }

    if (missing.length) {
      const startedAt = now();
      // One Storage request for the whole page, shared by concurrent visitors.
      const batch = Promise.resolve()
        .then(() => sign(missing))
        .then((images) => new Map(images.map((image) => [image.path, image])))
        .catch(() => new Map<string, SignedImage>());

      for (const path of missing) {
        const request = batch
          .then((images) => {
            const image = images.get(path);
            if (!image?.url || image.expiresAt <= now() + expiryMargin) return null;
            const refreshAt = Math.min(startedAt + reuseFor, image.expiresAt - expiryMargin);
            if (refreshAt > now()) {
              entries.set(path, {url: image.url, refreshAt});
              while (entries.size > maxEntries) {
                entries.delete(entries.keys().next().value!);
              }
            }
            return image.url;
          })
          .finally(() => pending.delete(path));
        pending.set(path, request);
      }
    }

    await Promise.all(uniquePaths.map(async (path) => {
      if (!urls.has(path)) urls.set(path, await pending.get(path) ?? null);
    }));
    return urls;
  };
}
