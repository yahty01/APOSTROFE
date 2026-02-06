import Image from 'next/image';
import Link from 'next/link';

import {buildLicenseRequestText, buildTelegramShareUrl} from '@/lib/telegram';

import type {AssetListItem} from './types';

function formatIsoDate(value: string) {
  if (!value) return '—';
  const d = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : value;
}

export function AssetCards({items}: {items: AssetListItem[]}) {
  return (
    <div className="border border-[color:var(--color-line)] bg-[var(--color-line)] p-px">
      <div className="grid grid-cols-1 gap-px bg-[var(--color-line)] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => {
          const timestamp = formatIsoDate(item.updated_at);
          const license = (item.license_type || 'STANDARD').toUpperCase();
          const status = (item.status || 'AVAILABLE').toUpperCase();
          const description = (item.description || item.title || '').trim();

          const telegramHref = buildTelegramShareUrl(buildLicenseRequestText(item));

          return (
            <article
              key={item.id}
              className="group flex flex-col bg-[var(--color-surface)]"
            >
              <Link
                href={`/models/${encodeURIComponent(item.document_id)}`}
                className="relative aspect-[4/5] w-full bg-[var(--color-paper)]"
              >
                {item.preview_url ? (
                  <Image
                    src={item.preview_url}
                    alt={item.title}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                    NO IMAGE
                  </div>
                )}
              </Link>

              <div className="mt-px flex flex-1 flex-col gap-px bg-[var(--color-line)]">
                <div className="flex-1 divide-y divide-[color:var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] group-hover:divide-white/30 group-hover:bg-black group-hover:text-white">
                  <div className="flex items-start justify-between gap-4 px-3 py-2 font-doc text-[10px] uppercase tracking-[0.18em]">
                    <div className="text-[var(--color-muted)] group-hover:text-white/70">
                      DOCUMENT_ID
                    </div>
                    <div className="text-right">{item.document_id}</div>
                  </div>
                  <div className="flex items-start justify-between gap-4 px-3 py-2 font-doc text-[10px] uppercase tracking-[0.18em]">
                    <div className="text-[var(--color-muted)] group-hover:text-white/70">
                      TIMESTAMP
                    </div>
                    <div className="text-right">{timestamp}</div>
                  </div>
                  <div className="flex items-start justify-between gap-4 px-3 py-2 font-doc text-[10px] uppercase tracking-[0.18em]">
                    <div className="text-[var(--color-muted)] group-hover:text-white/70">
                      LICENSE
                    </div>
                    <div className="text-right">{license}</div>
                  </div>
                  <div className="flex items-start justify-between gap-4 px-3 py-2 font-doc text-[10px] uppercase tracking-[0.18em]">
                    <div className="text-[var(--color-muted)] group-hover:text-white/70">
                      STATUS
                    </div>
                    <div className="text-right">{status}</div>
                  </div>
                  <div className="px-3 py-2">
                    <div className="font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)] group-hover:text-white/70">
                      DESCRIPTION
                    </div>
                    <div className="mt-1 line-clamp-4 font-doc text-[11px] uppercase tracking-[0.14em]">
                      {description || '—'}
                    </div>
                  </div>
                </div>

                <a
                  href={telegramHref}
                  target="_blank"
                  rel="noreferrer"
                  className="ui-btn-primary w-full"
                >
                  [ ACQUIRE LICENSE ]
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
