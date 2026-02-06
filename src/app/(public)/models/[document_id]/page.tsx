import Image from 'next/image';
import Link from 'next/link';
import {notFound} from 'next/navigation';

import {createSignedImageUrl} from '@/lib/supabase/images';
import {createSupabasePublicClient} from '@/lib/supabase/public';
import {
  buildLicenseRequestText,
  buildRequestInfoText,
  buildTelegramShareUrl
} from '@/lib/telegram';

export const dynamic = 'force-dynamic';

function formatIsoDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : value;
}

function renderKeyValue(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>);
  if (!entries.length) return null;
  return (
    <dl className="grid grid-cols-1 gap-px bg-[var(--color-line)] sm:grid-cols-2">
      {entries.map(([k, v]) => (
        <div key={k} className="bg-[var(--color-paper)] px-3 py-2">
          <dt className="font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {k}
          </dt>
          <dd className="mt-1 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink)]">
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

  let heroUrl: string | null = null;
  let galleryUrls: string[] = [];

  try {
    const supabase = createSupabasePublicClient();
    const {data: asset, error: assetError} = await supabase
      .from('assets')
      .select(
        'id,document_id,title,description,measurements,details,category,license_type,status,updated_at'
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

    const timestamp = formatIsoDate(asset.updated_at);
    const license = (asset.license_type || 'STANDARD').toUpperCase();
    const status = (asset.status || 'AVAILABLE').toUpperCase();
    const description = (asset.description || asset.title || '').trim() || '—';

    const acquireHref = buildTelegramShareUrl(buildLicenseRequestText(asset));
    const requestInfoHref = buildTelegramShareUrl(buildRequestInfoText(asset));

    const thumbs = galleryUrls.slice(0, 4);

    return (
      <div className="space-y-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/models"
            className="font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            ← BACK
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-px bg-[var(--color-line)] lg:grid-cols-2">
          <section className="bg-[var(--color-surface)] p-4">
            <div className="relative aspect-[4/5] w-full bg-[var(--color-paper)]">
              {heroUrl ? (
                <Image
                  src={heroUrl}
                  alt={asset.title}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  NO HERO IMAGE
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-px bg-[var(--color-line)] sm:grid-cols-4">
              {thumbs.length ? (
                thumbs.map((url, idx) => (
                  <div
                    key={url}
                    className="relative aspect-square bg-[var(--color-paper)]"
                  >
                    <Image
                      src={url}
                      alt={`${asset.title} ${idx + 1}`}
                      fill
                      className="object-cover object-center"
                      sizes="160px"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-[var(--color-paper)] p-4 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  NO THUMBNAILS
                </div>
              )}
            </div>
          </section>

          <section className="bg-[var(--color-surface)] p-6">
            <h1 className="font-condensed text-[clamp(32px,4vw,52px)] leading-[0.9] uppercase tracking-[0.14em]">
              {asset.document_id}
            </h1>
            <div className="mt-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {status} · {license} · {timestamp}
            </div>

            <div className="mt-6 divide-y divide-[color:var(--color-line)]">
              <div className="py-5">
                <div className="font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                  DESCRIPTION
                </div>
                <div className="mt-2 font-doc text-[11px] uppercase tracking-[0.14em]">
                  {description}
                </div>
              </div>

              {asset.measurements ? (
                <div className="py-5">
                  <div className="font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    MEASUREMENTS
                  </div>
                  <div className="mt-3">
                    {renderKeyValue(asset.measurements) ?? (
                      <pre className="overflow-auto bg-[var(--color-paper)] p-3 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                        {JSON.stringify(asset.measurements, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ) : null}

              {asset.details ? (
                <div className="py-5">
                  <div className="font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    DETAILS
                  </div>
                  <div className="mt-3">
                    {renderKeyValue(asset.details) ?? (
                      <pre className="overflow-auto bg-[var(--color-paper)] p-3 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                        {JSON.stringify(asset.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <a
                href={acquireHref}
                target="_blank"
                rel="noreferrer"
                className="ui-btn-primary w-full"
              >
                [ ACQUIRE LICENSE ]
              </a>
              <a
                href={requestInfoHref}
                target="_blank"
                rel="noreferrer"
                className="ui-btn-outline w-full"
              >
                [ REQUEST INFO ]
              </a>
            </div>
          </section>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}
