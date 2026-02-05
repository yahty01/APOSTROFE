import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';

import {createSignedImageUrl} from '@/lib/supabase/images';
import {createSupabasePublicClient} from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

function renderKeyValue(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>);
  if (!entries.length) return null;
  return (
    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {entries.map(([k, v]) => (
        <div
          key={k}
          className="rounded-lg border border-black/10 bg-white px-3 py-2"
        >
          <dt className="text-xs font-medium text-black/60">{k}</dt>
          <dd className="mt-1 text-sm text-black">
            {typeof v === 'string' || typeof v === 'number' ? String(v) : '—'}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default async function ModelDetailPage({
  params
}: {
  params: Promise<{document_id: string}>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const {document_id} = await params;
  const t = await getTranslations('public.detail');

  let heroUrl: string | null = null;
  let galleryUrls: string[] = [];

  try {
    const supabase = createSupabasePublicClient();
    const {data: asset, error: assetError} = await supabase
      .from('assets')
      .select(
        'id,document_id,title,description,measurements,details,category,license_type,status'
      )
      .eq('document_id', document_id)
      .maybeSingle();

    if (assetError || !asset) notFound();

    const {data: media} = await supabase
      .from('asset_media')
      .select('path,kind,order_index')
      .eq('asset_id', asset.id)
      .order('kind', {ascending: true})
      .order('order_index', {ascending: true});

    const heroPath = media?.find((m) => m.kind === 'hero')?.path ?? null;
    const galleryPaths = (media ?? [])
      .filter((m) => m.kind === 'gallery')
      .sort((a, b) => a.order_index - b.order_index)
      .map((m) => m.path);

    heroUrl = heroPath
      ? await createSignedImageUrl(supabase, heroPath, {width: 1600, quality: 82})
      : null;

    galleryUrls = (
      await Promise.all(
        galleryPaths.map((p) =>
          createSignedImageUrl(supabase, p, {width: 600, quality: 80})
        )
      )
    ).filter((u): u is string => Boolean(u));

    const message = encodeURIComponent(
      `Здравствуйте! Интересует модель ${asset.document_id} — ${asset.title}`
    );
    const telegramHref = `https://t.me/share/url?text=${message}`;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/models"
            className="text-sm text-black/70 hover:text-black"
          >
            ← Back
          </Link>
          <a
            href={telegramHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white hover:bg-black/90"
          >
            {t('telegramCta')}
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-black/10 bg-zinc-100">
              {heroUrl ? (
                <Image
                  src={heroUrl}
                  alt={asset.title}
                  fill
                  className="object-contain object-center"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-black/40">
                  No hero image
                </div>
              )}
            </div>

            {galleryUrls.length ? (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {galleryUrls.slice(0, 10).map((url, idx) => (
                  <div
                    key={url}
                    className="relative aspect-square overflow-hidden rounded-xl border border-black/10 bg-zinc-100"
                  >
                    <Image
                      src={url}
                      alt={`${asset.title} ${idx + 1}`}
                      fill
                      className="object-contain object-center"
                      sizes="120px"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <h1 className="text-2xl font-semibold tracking-tight">
                {asset.title}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-black/60">
                <span className="rounded-full bg-black/5 px-2 py-1">
                  {asset.document_id}
                </span>
                {asset.category ? (
                  <span className="rounded-full bg-black/5 px-2 py-1">
                    {asset.category}
                  </span>
                ) : null}
                {asset.license_type ? (
                  <span className="rounded-full bg-black/5 px-2 py-1">
                    {asset.license_type}
                  </span>
                ) : null}
                {asset.status ? (
                  <span className="rounded-full bg-black/5 px-2 py-1">
                    {asset.status}
                  </span>
                ) : null}
              </div>
              {asset.description ? (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-black/80">
                  {asset.description}
                </p>
              ) : null}
            </div>

            {asset.measurements ? (
              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold">{t('measurements')}</h2>
                <div className="mt-3">
                  {renderKeyValue(asset.measurements) ?? (
                    <pre className="overflow-auto rounded-lg bg-zinc-50 p-3 text-xs text-black/70">
                      {JSON.stringify(asset.measurements, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ) : null}

            {asset.details ? (
              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold">{t('details')}</h2>
                <div className="mt-3">
                  {renderKeyValue(asset.details) ?? (
                    <pre className="overflow-auto rounded-lg bg-zinc-50 p-3 text-xs text-black/70">
                      {JSON.stringify(asset.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
