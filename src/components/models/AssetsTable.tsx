'use client';

import Link from 'next/link';
import {useTranslations} from 'next-intl';
import {useVirtualizer} from '@tanstack/react-virtual';
import {useMemo, useRef, useState} from 'react';

import {getAssetDescription, getAssetFieldValue} from './asset-fields';
import {
  assetsTableClasses,
  getVirtualRowStyle,
  getVirtualizerContainerStyle
} from './AssetsTable.styles';
import type {AssetFieldKey, AssetListItem} from './types';

function normalizeFields(fields: AssetFieldKey[]) {
  const fallback: AssetFieldKey[] = ['name', 'createdAt', 'license', 'status'];
  return [...fields, ...fallback].slice(0, 4);
}

export function AssetsTable({
  items,
  fields,
  detailBasePath
}: {
  items: AssetListItem[];
  fields: AssetFieldKey[];
  detailBasePath?: string;
}) {
  const t = useTranslations('public');
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const gridCols = useMemo(() => assetsTableClasses.gridCols, []);
  const [fieldA, fieldB, fieldC, fieldD] = useMemo(
    () => normalizeFields(fields),
    [fields]
  );

  // Виртуализация списка: считаем общую высоту и выдаём "виртуальные" индексы для текущего scroll.
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 68,
    measureElement: (element) =>
      element?.getBoundingClientRect().height ?? 68,
    overscan: 10
  });

  return (
    <div className={assetsTableClasses.root}>
      <div className={assetsTableClasses.mobileList}>
        {items.map((item) => {
          const firstValue = getAssetFieldValue(item, fieldA);
          const secondValue = getAssetFieldValue(item, fieldB);
          const thirdValue = getAssetFieldValue(item, fieldC);
          const fourthValue = getAssetFieldValue(item, fieldD);
          const description = getAssetDescription(item);
          const detailHref = detailBasePath
            ? `${detailBasePath}/${encodeURIComponent(item.document_id)}`
            : null;

          return (
            <div key={item.id} className={assetsTableClasses.mobileItem}>
              <div className={assetsTableClasses.mobileTopRow}>
                {detailHref ? (
                  <Link href={detailHref} className={assetsTableClasses.mobileDocLink}>
                    {firstValue}
                  </Link>
                ) : (
                  <div className={assetsTableClasses.mobileDocLink}>{firstValue}</div>
                )}
                <div className={assetsTableClasses.mobileTimestamp}>
                  {secondValue}
                </div>
              </div>

              <div className={assetsTableClasses.mobileMetaGrid}>
                <div>
                  <div className={assetsTableClasses.mobileMetaLabel}>
                    {t(`asset.${fieldC}`)}
                  </div>
                  <div className={assetsTableClasses.mobileMetaValue}>
                    {thirdValue}
                  </div>
                </div>
                <div>
                  <div className={assetsTableClasses.mobileMetaLabel}>
                    {t(`asset.${fieldD}`)}
                  </div>
                  <div className={assetsTableClasses.mobileMetaValue}>
                    {fourthValue}
                  </div>
                </div>
              </div>

              <div className={assetsTableClasses.mobileDesc}>
                {description}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden md:block">
        <div
          className={`${assetsTableClasses.headerRow} ${gridCols}`}
        >
          <div className={assetsTableClasses.headerCell}>
            {t(`asset.${fieldA}`)}
          </div>
          <div className={assetsTableClasses.headerCell}>
            {t(`asset.${fieldB}`)}
          </div>
          <div className={assetsTableClasses.headerCell}>
            {t(`asset.${fieldC}`)}
          </div>
          <div className={assetsTableClasses.headerCell}>
            {t(`asset.${fieldD}`)}
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

              const firstValue = getAssetFieldValue(item, fieldA);
              const secondValue = getAssetFieldValue(item, fieldB);
              const thirdValue = getAssetFieldValue(item, fieldC);
              const fourthValue = getAssetFieldValue(item, fieldD);
              const description = getAssetDescription(item);
              const detailHref = detailBasePath
                ? `${detailBasePath}/${encodeURIComponent(item.document_id)}`
                : null;

              return (
                <div
                  key={virtualRow.key}
                  className={`${assetsTableClasses.rowBase} ${
                    isSelected ? assetsTableClasses.rowSelected : assetsTableClasses.rowDefault
                  }`}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
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
                      {detailHref ? (
                        <Link href={detailHref} className={assetsTableClasses.cellLink}>
                          {firstValue}
                        </Link>
                      ) : (
                        firstValue
                      )}
                    </div>
                    <div
                      className={`${assetsTableClasses.cellBase} ${
                        isSelected
                          ? assetsTableClasses.cellBorderSelected
                          : assetsTableClasses.cellBorderDefault
                      }`}
                    >
                      {secondValue}
                    </div>
                    <div
                      className={`${assetsTableClasses.cellBase} ${
                        isSelected
                          ? assetsTableClasses.cellBorderSelected
                          : assetsTableClasses.cellBorderDefault
                      }`}
                    >
                      {thirdValue}
                    </div>
                    <div
                      className={`${assetsTableClasses.cellBase} ${
                        isSelected
                          ? assetsTableClasses.cellBorderSelected
                          : assetsTableClasses.cellBorderDefault
                      }`}
                    >
                      {fourthValue}
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
    </div>
  );
}
