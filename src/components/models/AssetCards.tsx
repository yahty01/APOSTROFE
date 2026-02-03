import Image from 'next/image';
import Link from 'next/link';

import type {AssetListItem} from './types';

export function AssetCards({items}: {items: AssetListItem[]}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/models/${encodeURIComponent(item.document_id)}`}
          className="group overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition hover:shadow-md"
        >
          <div className="relative aspect-[4/3] w-full bg-zinc-100">
            {item.preview_url ? (
              <Image
                src={item.preview_url}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-black/40">
                No image
              </div>
            )}
          </div>

          <div className="space-y-2 p-4">
            <div className="line-clamp-2 text-base font-semibold leading-snug">
              {item.title}
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-black/60">
              <span className="rounded-full bg-black/5 px-2 py-1">
                {item.document_id}
              </span>
              {item.category ? (
                <span className="rounded-full bg-black/5 px-2 py-1">
                  {item.category}
                </span>
              ) : null}
              {item.license_type ? (
                <span className="rounded-full bg-black/5 px-2 py-1">
                  {item.license_type}
                </span>
              ) : null}
              {item.status ? (
                <span className="rounded-full bg-black/5 px-2 py-1">
                  {item.status}
                </span>
              ) : null}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

