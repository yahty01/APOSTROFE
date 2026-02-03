'use client';

import Image from 'next/image';
import Link from 'next/link';
import {useVirtualizer} from '@tanstack/react-virtual';
import {useRef} from 'react';

import type {AssetListItem} from './types';

export function AssetsTable({items}: {items: AssetListItem[]}) {
  const parentRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 10
  });

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <div className="grid grid-cols-[80px_1fr_180px_160px_140px] items-center gap-3 border-b border-black/10 px-4 py-3 text-xs font-medium text-black/60">
        <div>Preview</div>
        <div>Title</div>
        <div>document_id</div>
        <div>Category</div>
        <div>Status</div>
      </div>

      <div ref={parentRef} className="max-h-[70vh] overflow-auto">
        <div
          className="relative"
          style={{height: `${rowVirtualizer.getTotalSize()}px`}}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = items[virtualRow.index];
            return (
              <div
                key={item.id}
                className="absolute left-0 top-0 w-full border-b border-black/5 px-4 py-3"
                style={{
                  transform: `translateY(${virtualRow.start}px)`
                }}
              >
                <div className="grid grid-cols-[80px_1fr_180px_160px_140px] items-center gap-3">
                  <div className="relative h-10 w-16 overflow-hidden rounded-md bg-zinc-100">
                    {item.preview_url ? (
                      <Image
                        src={item.preview_url}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-black">
                      {item.title}
                    </div>
                    <div className="truncate text-xs text-black/60">
                      {item.license_type ?? '—'}
                    </div>
                  </div>

                  <Link
                    href={`/models/${encodeURIComponent(item.document_id)}`}
                    className="truncate text-sm text-black/80 hover:text-black"
                  >
                    {item.document_id}
                  </Link>

                  <div className="truncate text-sm text-black/70">
                    {item.category ?? '—'}
                  </div>

                  <div className="truncate text-sm text-black/70">
                    {item.status ?? '—'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

