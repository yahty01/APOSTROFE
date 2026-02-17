'use client';

import Link from 'next/link';
import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';

import {
  getAdminBasePathForEntity,
  type AssetEntityType
} from '@/lib/assets/entity';

import {AssetForm} from '../AssetForm';
import {uploadGalleryAction, uploadHeroAction} from '../media-actions';

import {newModelClientClasses} from './NewModelClient.styles';

/**
 * Список типов, разрешённых в file input.
 * Используется в `NewModelClient` как подсказка браузеру и базовый фильтр выбора файлов.
 */
const acceptImages = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

/**
 * Клиентская часть страницы создания сущности реестра.
 * Может дополнительно подгружать hero/gallery сразу после сохранения.
 */
export function NewModelClient({
  entityType = 'model',
  withMedia = true,
  allowHero = true,
  allowGallery = true,
  redirectBasePath
}: {
  entityType?: AssetEntityType;
  withMedia?: boolean;
  allowHero?: boolean;
  allowGallery?: boolean;
  redirectBasePath?: string;
}) {
  const t = useTranslations('admin.modelForm');
  const tMedia = useTranslations('admin.media');
  const tCommon = useTranslations('common');
  const tToast = useTranslations('admin.toast');
  const router = useRouter();
  const adminBasePath = redirectBasePath ?? getAdminBasePathForEntity(entityType);
  const canUploadHero = withMedia && allowHero;
  const canUploadGallery = withMedia && allowGallery;
  const hasMediaInputs = canUploadHero || canUploadGallery;
  const mediaSectionsCount = Number(canUploadHero) + Number(canUploadGallery);

  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  const MB = 1024 * 1024;
  const softWarnSingleBytes = 4 * MB;
  const softWarnTotalBytes = 15 * MB;

  /**
   * Удобный перевод байт → мегабайты для UI-подсказок.
   * Используется только для отображения (не влияет на фактические лимиты аплоада).
   */
  function bytesToMb(bytes: number) {
    return Math.round((bytes / MB) * 10) / 10;
  }

  /**
   * Загружает выбранные файлы в Storage после того, как ассет создан и у нас есть его `assetId`.
   * Используется как `afterSave` callback из `AssetForm`.
   */
  async function uploadSelected(assetId: string) {
    if (!hasMediaInputs) return;

    if (canUploadHero && heroFile) {
      const fd = new FormData();
      fd.set('asset_id', assetId);
      fd.set('entity_type', entityType);
      fd.set('file', heroFile);
      const res = await uploadHeroAction(fd);
      if (!res.ok) toast.error(res.error || tToast('error'));
    }

    if (canUploadGallery && galleryFiles.length) {
      const fd = new FormData();
      fd.set('asset_id', assetId);
      fd.set('entity_type', entityType);
      galleryFiles.forEach((f) => fd.append('files', f));
      const res = await uploadGalleryAction(fd);
      if (!res.ok) toast.error(res.error || tToast('error'));
    }
  }

  return (
    <div className={newModelClientClasses.root}>
      <Link href={adminBasePath} className={newModelClientClasses.backLink}>
        ← {tCommon('back').toUpperCase()}
      </Link>

      <div className={newModelClientClasses.panel}>
        <AssetForm
          entityType={entityType}
          redirectBasePath={adminBasePath}
          initialValues={{}}
          redirectToEdit={false}
          afterSave={async (result) => {
            await uploadSelected(result.id);
            router.push(`${adminBasePath}/${result.id}`);
            router.refresh();
          }}
        />
      </div>

      {hasMediaInputs ? (
        <div className={newModelClientClasses.panel}>
          <div className={newModelClientClasses.panelHeaderRow}>
            <div>
              <div className={newModelClientClasses.panelTitle}>
                {tMedia('title')}
              </div>
              <div className={newModelClientClasses.panelSubtitle}>
                {tMedia('preUploadHelp')}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setHeroFile(null);
                setGalleryFiles([]);
              }}
              className={newModelClientClasses.clearButton}
            >
              {tMedia('clearSelection')}
            </button>
          </div>

          <div
            className={
              mediaSectionsCount > 1
                ? newModelClientClasses.inputsGrid
                : newModelClientClasses.inputsGridSingle
            }
          >
            {canUploadHero ? (
              <div className={newModelClientClasses.field}>
                <div className={newModelClientClasses.fieldLabel}>
                  {tMedia('hero')}
                </div>
                <label className={newModelClientClasses.fileLabel}>
                  <input
                    type="file"
                    accept={acceptImages}
                    className={newModelClientClasses.fileInputHidden}
                    onChange={(e) => setHeroFile(e.target.files?.[0] ?? null)}
                  />
                  {tMedia('selectFiles')}
                </label>
                <div className={newModelClientClasses.fileInfo}>
                  {heroFile ? (
                    <div className={newModelClientClasses.fileInfoList}>
                      <div className={newModelClientClasses.fileName}>
                        {heroFile.name}
                      </div>
                      <div>
                        {tMedia('sizeLabel', {mb: bytesToMb(heroFile.size)})}
                      </div>
                      {heroFile.size >= softWarnSingleBytes ? (
                        <div className={newModelClientClasses.warn}>
                          {tMedia('warningLargeFile', {mb: bytesToMb(heroFile.size)})}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    tMedia('noFilesSelected')
                  )}
                </div>
              </div>
            ) : null}

            {canUploadGallery ? (
              <div className={newModelClientClasses.field}>
                <div className={newModelClientClasses.fieldLabel}>
                  {tMedia('gallery')}
                </div>
                <label className={newModelClientClasses.fileLabel}>
                  <input
                    type="file"
                    accept={acceptImages}
                    multiple
                    className={newModelClientClasses.fileInputHidden}
                    onChange={(e) => setGalleryFiles(Array.from(e.target.files ?? []))}
                  />
                  {tMedia('selectFiles')}
                </label>
                <div className={newModelClientClasses.fileInfo}>
                  {galleryFiles.length ? (() => {
                    const totalBytes = galleryFiles.reduce((sum, file) => sum + file.size, 0);
                    const showWarn =
                      totalBytes >= softWarnTotalBytes ||
                      galleryFiles.some((f) => f.size >= softWarnSingleBytes);

                    return (
                      <div className={newModelClientClasses.fileInfoList}>
                        <div>{tMedia('filesSelected', {count: galleryFiles.length})}</div>
                        <div>{tMedia('sizeTotalLabel', {mb: bytesToMb(totalBytes)})}</div>
                        {showWarn ? (
                          <div className={newModelClientClasses.warn}>
                            {tMedia('warningLargeSelection', {
                              count: galleryFiles.length,
                              mb: bytesToMb(totalBytes)
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })() : (
                    <span>{tMedia('noFilesSelected')}</span>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className={newModelClientClasses.note}>
            {t('documentIdHelp')}
          </div>
        </div>
      ) : null}
    </div>
  );
}
