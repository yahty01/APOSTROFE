'use client';

import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {useVirtualizer} from '@tanstack/react-virtual';
import {useMemo, useRef, useState} from 'react';

import type {AssetListItem} from './types';
import {
  assetsTableClasses,
  getVirtualRowStyle,
  getVirtualizerContainerStyle
} from './AssetsTable.styles';

/**
 * Вытаскивает YYYY-MM-DD из ISO-строки, чтобы таблица выглядела компактно.
 * Используется в `AssetsTable` для отображения `updated_at`.
 */
function formatIsoDate(value: string) {
  if (!value) return '—';
  const d = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : value;
}

/**
 * Табличный вид каталога моделей с виртуализацией строк.
 * Используется на `/models` при `view=list`: рендерит только видимую часть списка через `@tanstack/react-virtual`.
 */
export function AssetsTable({items}: {items: AssetListItem[]}) {
  const t = useTranslations('public');
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const gridCols = useMemo(
    () => assetsTableClasses.gridCols,
    []
  );

  // Виртуализация списка: считаем общую высоту и выдаём "виртуальные" индексы для текущего scroll.
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 10
  });

  return (
    <div className={assetsTableClasses.root}>
      <div
        className={`${assetsTableClasses.headerRow} ${gridCols}`}
      >
        <div className={assetsTableClasses.headerCell}>
          {t('asset.documentId')}
        </div>
        <div className={assetsTableClasses.headerCell}>
          {t('asset.timestamp')}
        </div>
        <div className={assetsTableClasses.headerCell}>
          {t('asset.licenseType')}
        </div>
        <div className={assetsTableClasses.headerCell}>
          {t('asset.status')}
        </div>
        <div className={assetsTableClasses.headerCellLast}>
          {t('asset.description')}
        </div>
      </div>

      <div ref={parentRef} className={assetsTableClasses.scrollArea}>
        <div
          className={assetsTableClasses.virtualContainer}
          style={getVirtualizerContainerStyle(rowVirtualizer.getTotalSize())}
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
                className={`${assetsTableClasses.rowBase} ${
                  isSelected ? assetsTableClasses.rowSelected : assetsTableClasses.rowDefault
                }`}
                style={getVirtualRowStyle(virtualRow.start)}
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
                <div className={`${assetsTableClasses.rowGrid} ${gridCols}`}>
                  <div
                    className={`${assetsTableClasses.cellBase} ${
                      isSelected
                        ? assetsTableClasses.cellBorderSelected
                        : assetsTableClasses.cellBorderDefault
                    }`}
                  >
                    <Link
                      href={`/models/${encodeURIComponent(item.document_id)}`}
                      className={assetsTableClasses.cellLink}
                    >
                      {item.document_id}
                    </Link>
                  </div>
                  <div
                    className={`${assetsTableClasses.cellBase} ${
                      isSelected
                        ? assetsTableClasses.cellBorderSelected
                        : assetsTableClasses.cellBorderDefault
                    }`}
                  >
                    {timestamp}
                  </div>
                  <div
                    className={`${assetsTableClasses.cellBase} ${
                      isSelected
                        ? assetsTableClasses.cellBorderSelected
                        : assetsTableClasses.cellBorderDefault
                    }`}
                  >
                    {license}
                  </div>
                  <div
                    className={`${assetsTableClasses.cellBase} ${
                      isSelected
                        ? assetsTableClasses.cellBorderSelected
                        : assetsTableClasses.cellBorderDefault
                    }`}
                  >
                    {status}
                  </div>
                  <div className={assetsTableClasses.descCell}>
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
