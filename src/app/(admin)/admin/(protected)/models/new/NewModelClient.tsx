'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';

import {AssetForm} from '../AssetForm';
import {uploadGalleryAction, uploadHeroAction} from '../media-actions';

import {newModelClientClasses} from './NewModelClient.styles';

/**
 * Список типов, разрешённых в file input.
 * Используется в `NewModelClient` как подсказка браузеру и базовый фильтр выбора файлов.
 */
const acceptImages = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

/**
 * Клиентская часть страницы создания модели.
 * Помимо `AssetForm` позволяет заранее выбрать hero/gallery файлы и загрузить их сразу после сохранения ассета.
 */
export function NewModelClient() {
  const t = useTranslations('admin.modelForm');
  const tMedia = useTranslations('admin.media');
  const tToast = useTranslations('admin.toast');
  const router = useRouter();

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
    if (heroFile) {
      const fd = new FormData();
      fd.set('asset_id', assetId);
      fd.set('file', heroFile);
      const res = await uploadHeroAction(fd);
      if (!res.ok) toast.error(res.error || tToast('error'));
    }

    if (galleryFiles.length) {
      const fd = new FormData();
      fd.set('asset_id', assetId);
      galleryFiles.forEach((f) => fd.append('files', f));
      const res = await uploadGalleryAction(fd);
      if (!res.ok) toast.error(res.error || tToast('error'));
    }
  }

  return (
    <div className={newModelClientClasses.root}>
      <div className={newModelClientClasses.panel}>
        <AssetForm
          initialValues={{}}
          redirectToEdit={false}
          afterSave={async (result) => {
            await uploadSelected(result.id);
            router.push(`/admin/models/${result.id}`);
            router.refresh();
          }}
        />
      </div>

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

        <div className={newModelClientClasses.inputsGrid}>
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
        </div>

        <div className={newModelClientClasses.note}>
          {t('documentIdHelp')}
        </div>
      </div>
    </div>
  );
}
