'use client';

import Link from 'next/link';
import {useVirtualizer} from '@tanstack/react-virtual';
import {useMemo, useRef, useState} from 'react';

import type {AssetListItem} from './types';

function formatIsoDate(value: string) {
  if (!value) return '—';
  const d = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : value;
}

export function AssetsTable({items}: {items: AssetListItem[]}) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const gridCols = useMemo(
    () => 'grid-cols-[180px_140px_160px_140px_1fr]',
    []
  );

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10
  });

  return (
    <div className="border border-[color:var(--color-line)] bg-[var(--color-paper)]">
      <div
        className={`grid ${gridCols} items-center border-b border-[color:var(--color-line)] bg-black`}
      >
        <div className="border-r border-white/20 px-4 py-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-white">
          DOCUMENT_ID
        </div>
        <div className="border-r border-white/20 px-4 py-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-white">
          TIMESTAMP
        </div>
        <div className="border-r border-white/20 px-4 py-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-white">
          LICENSE_TYPE
        </div>
        <div className="border-r border-white/20 px-4 py-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-white">
          STATUS
        </div>
        <div className="px-4 py-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-white">
          DESCRIPTION
        </div>
      </div>

      <div ref={parentRef} className="max-h-[70vh] overflow-auto">
        <div
          className="relative"
          style={{height: `${rowVirtualizer.getTotalSize()}px`}}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const item = items[virtualRow.index];
            const isSelected = selectedId === item.id;

            const timestamp = formatIsoDate(item.updated_at);
            const license = (item.license_type || 'STANDARD').toUpperCase();
            const status = (item.status || 'AVAILABLE').toUpperCase();
            const description = (item.description || item.title || '').trim() || '—';

            return (
              <div
                key={item.id}
                className={`absolute left-0 top-0 w-full border-b border-[color:var(--color-line)] ${
                  isSelected
                    ? 'bg-black text-white'
                    : 'bg-[var(--color-surface)] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-surface),#000_6%)]'
                }`}
                style={{
                  transform: `translateY(${virtualRow.start}px)`
                }}
                onClick={() => setSelectedId(isSelected ? null : item.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedId(isSelected ? null : item.id);
                  }
                }}
              >
                <div className={`grid ${gridCols} items-center`}>
                  <div
                    className={`border-r px-4 py-3 font-doc text-[11px] uppercase tracking-[0.18em] ${
                      isSelected ? 'border-white/20' : 'border-[color:var(--color-line)]'
                    }`}
                  >
                    <Link
                      href={`/models/${encodeURIComponent(item.document_id)}`}
                      className="hover:underline"
                    >
                      {item.document_id}
                    </Link>
                  </div>
                  <div
                    className={`border-r px-4 py-3 font-doc text-[11px] uppercase tracking-[0.18em] ${
                      isSelected ? 'border-white/20' : 'border-[color:var(--color-line)]'
                    }`}
                  >
                    {timestamp}
                  </div>
                  <div
                    className={`border-r px-4 py-3 font-doc text-[11px] uppercase tracking-[0.18em] ${
                      isSelected ? 'border-white/20' : 'border-[color:var(--color-line)]'
                    }`}
                  >
                    {license}
                  </div>
                  <div
                    className={`border-r px-4 py-3 font-doc text-[11px] uppercase tracking-[0.18em] ${
                      isSelected ? 'border-white/20' : 'border-[color:var(--color-line)]'
                    }`}
                  >
                    {status}
                  </div>
                  <div className="px-4 py-3 font-doc text-[11px] uppercase tracking-[0.14em]">
                    {description}
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
