'use client';

import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {useTransition} from 'react';
import {useTranslations} from 'next-intl';
import {toast} from 'sonner';

import {useReportPending} from '@/lib/pending';
import type {AssetEntityType} from '@/lib/assets/entity';

import {
  deleteMediaAction,
  moveGalleryMediaAction,
  uploadCatalogAction,
  uploadGalleryAction,
  uploadHeroAction
} from './media-actions';
import {mediaManagerClasses} from './MediaManager.styles';

/**
 * UI-тип медиа-элемента для админки.
 * Заполняется на сервере (страница редактирования) и используется для рендера catalog/hero/gallery в `MediaManager`.
 */
export type AdminMediaItem = {
  id: string;
  path: string;
  url: string | null;
  kind: 'catalog' | 'hero' | 'gallery';
  order_index: number;
};

/**
 * Управление медиа ассета: загрузка catalog/hero, загрузка/сортировка/удаление gallery.
 * Используется на страницах редактирования сущностей с медиа (`models`, `creators`, `influencers`).
 */
export function MediaManager({
  assetId,
  documentId,
  entityType = 'model',
  allowCatalog = true,
  allowHero = true,
  allowGallery = true,
  catalog,
  hero,
  gallery
}: {
  assetId: string;
  documentId: string;
  entityType?: AssetEntityType;
  allowCatalog?: boolean;
  allowHero?: boolean;
  allowGallery?: boolean;
  catalog: AdminMediaItem | null;
  hero: AdminMediaItem | null;
  gallery: AdminMediaItem[];
}) {
  const t = useTranslations('admin.media');
  const tToast = useTranslations('admin.toast');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  useReportPending(isPending);

  const MB = 1024 * 1024;
  const maxBytes = 10 * 1024 * 1024;
  const acceptImages = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

  const softWarnSingleBytes = 4 * MB;
  const softWarnTotalBytes = 15 * MB;

  /**
   * Переводит байты в мегабайты для отображения пользователю.
   * Используется только в предупреждениях (toast).
   */
  function bytesToMb(bytes: number) {
    return Math.round((bytes / MB) * 10) / 10;
  }

  /**
   * Быстрая проверка типа/размера файла перед отправкой на сервер.
   * Нужна, чтобы сразу показать понятную ошибку в UI, не нагружая server actions.
   */
  function validateFile(file: File): string | null {
    if (!file.type.startsWith('image/')) return t('errorOnlyImages');
    if (file.size > maxBytes) return t('errorTooLarge', {mb: 10});
    return null;
  }

  function onUploadSingle(file: File | null, kind: 'catalog' | 'hero') {
    if (!file) return;
    const err = validateFile(file);
    if (err) {
      toast.error(err);
      return;
    }

    if (file.size >= softWarnSingleBytes) {
      toast(t('warningLargeFile', {mb: bytesToMb(file.size)}));
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.set('asset_id', assetId);
      fd.set('entity_type', entityType);
      fd.set('file', file);
      const res =
        kind === 'catalog'
          ? await uploadCatalogAction(fd)
          : await uploadHeroAction(fd);
      if (!res.ok) toast.error(res.error || tToast('error'));
      else toast.success(tToast('saved'));
      router.refresh();
    });
  }

  function onUploadCatalog(file: File | null) {
    onUploadSingle(file, 'catalog');
  }

  /**
   * Загрузка hero-файла: валидируем, при необходимости предупреждаем про размер, вызываем `uploadHeroAction`.
   */
  function onUploadHero(file: File | null) {
    onUploadSingle(file, 'hero');
  }

  /**
   * Загрузка набора gallery-файлов: валидируем каждый файл и суммарный размер, затем вызываем `uploadGalleryAction`.
   */
  function onUploadGallery(files: FileList | null) {
    if (!files || !files.length) return;
    const list = Array.from(files);
    const firstError = list.map(validateFile).find(Boolean) ?? null;
    if (firstError) {
      toast.error(firstError);
      return;
    }

    const totalBytes = list.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes >= softWarnTotalBytes) {
      toast(t('warningLargeSelection', {count: list.length, mb: bytesToMb(totalBytes)}));
    } else {
      const large = list.find((f) => f.size >= softWarnSingleBytes) ?? null;
      if (large) toast(t('warningLargeFile', {mb: bytesToMb(large.size)}));
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.set('asset_id', assetId);
      fd.set('entity_type', entityType);
      list.forEach((f) => fd.append('files', f));
      const res = await uploadGalleryAction(fd);
      if (!res.ok) toast.error(res.error || tToast('error'));
      else toast.success(tToast('saved'));
      router.refresh();
    });
  }

  /**
   * Перемещает gallery-элемент вверх/вниз (swap) через server action.
   */
  function move(mediaId: string, direction: 'up' | 'down') {
    startTransition(async () => {
      const res = await moveGalleryMediaAction({
        asset_id: assetId,
        entity_type: entityType,
        media_id: mediaId,
        direction
      });
      if (!res.ok) toast.error(res.error || tToast('error'));
      router.refresh();
    });
  }

  /**
   * Удаляет catalog/hero/gallery элемент через server action и обновляет страницу.
   */
  function remove(mediaId: string) {
    startTransition(async () => {
      const res = await deleteMediaAction({
        asset_id: assetId,
        entity_type: entityType,
        media_id: mediaId
      });
      if (!res.ok) toast.error(res.error || tToast('error'));
      else toast.success(tToast('saved'));
      router.refresh();
    });
  }

  return (
    <div className={mediaManagerClasses.root}>
      <div className={mediaManagerClasses.howPanel}>
        <div className={mediaManagerClasses.howTitle}>
          {t('howItWorksTitle')}
        </div>
        <div className={mediaManagerClasses.howList}>
          <div>{t('howItWorksFormats', {mb: 10})}</div>
          <div>{t('howItWorksPaths', {documentId})}</div>
          <div>{t('catalogFormatHelp')}</div>
          <div>{t('heroFormatHelp')}</div>
          <div>{t('galleryFormatHelp')}</div>
          <div>{t('howItWorksPublish')}</div>
          <div>{t('storageNote')}</div>
        </div>
      </div>

      {allowCatalog ? (
        <div className={mediaManagerClasses.section}>
          <div className={mediaManagerClasses.sectionHeader}>
            <div>
              <h2 className={mediaManagerClasses.sectionTitle}>
                {t('catalog')}
              </h2>
              <div className={mediaManagerClasses.sectionHint}>
                {t('catalogFormatHelp')}
              </div>
            </div>
            <label className={mediaManagerClasses.uploadLabel}>
              <input
                type="file"
                accept={acceptImages}
                className={mediaManagerClasses.hiddenInput}
                disabled={isPending}
                onChange={(e) => onUploadCatalog(e.target.files?.[0] ?? null)}
              />
              {isPending ? tCommon('loading') : t('upload')}
            </label>
          </div>

          <div className={mediaManagerClasses.catalogPreview}>
            {catalog?.url ? (
              <Image
                src={catalog.url}
                alt="Catalog"
                fill
                className={mediaManagerClasses.previewImage}
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            ) : (
              <div className={mediaManagerClasses.previewFallback}>
                {t('emptyCatalog')}
              </div>
            )}
          </div>

          {catalog ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => remove(catalog.id)}
              className={mediaManagerClasses.removeSingleButton}
            >
              {t('remove')}
            </button>
          ) : null}
        </div>
      ) : null}

      {allowHero ? (
        <div className={mediaManagerClasses.section}>
          <div className={mediaManagerClasses.sectionHeader}>
            <div>
              <h2 className={mediaManagerClasses.sectionTitle}>
                {t('hero')}
              </h2>
              <div className={mediaManagerClasses.sectionHint}>
                {t('heroFormatHelp')}
              </div>
            </div>
            <label className={mediaManagerClasses.uploadLabel}>
              <input
                type="file"
                accept={acceptImages}
                className={mediaManagerClasses.hiddenInput}
                disabled={isPending}
                onChange={(e) => onUploadHero(e.target.files?.[0] ?? null)}
              />
              {isPending ? tCommon('loading') : t('upload')}
            </label>
          </div>

          <div className={mediaManagerClasses.heroPreview}>
            {hero?.url ? (
              <Image
                src={hero.url}
                alt="Hero"
                fill
                className={mediaManagerClasses.previewImage}
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            ) : (
              <div className={mediaManagerClasses.previewFallback}>
                {t('emptyHero')}
              </div>
            )}
          </div>

          {hero ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => remove(hero.id)}
              className={mediaManagerClasses.removeSingleButton}
            >
              {t('remove')}
            </button>
          ) : null}
        </div>
      ) : null}

      {allowGallery ? (
        <div className={mediaManagerClasses.section}>
          <div className={mediaManagerClasses.sectionHeader}>
            <div>
              <h2 className={mediaManagerClasses.sectionTitle}>
                {t('gallery')}
              </h2>
              <div className={mediaManagerClasses.sectionHint}>
                {t('galleryFormatHelp')}
              </div>
            </div>
            <label className={mediaManagerClasses.uploadLabel}>
              <input
                type="file"
                accept={acceptImages}
                multiple
                className={mediaManagerClasses.hiddenInput}
                disabled={isPending}
                onChange={(e) => onUploadGallery(e.target.files)}
              />
              {isPending ? tCommon('loading') : t('upload')}
            </label>
          </div>

          {gallery.length ? (
            <div className={mediaManagerClasses.galleryGrid}>
              {gallery
                .slice()
                .sort((a, b) => a.order_index - b.order_index)
                .map((item, idx, arr) => (
                  <div
                    key={item.id}
                    className={mediaManagerClasses.galleryItem}
                  >
                    <div className={mediaManagerClasses.galleryThumb}>
                      {item.url ? (
                        <Image
                          src={item.url}
                          alt={`Gallery ${idx + 1}`}
                          fill
                          className={mediaManagerClasses.previewImage}
                          sizes="200px"
                        />
                      ) : null}
                    </div>

                    <div className={mediaManagerClasses.galleryMetaRow}>
                      <div className={mediaManagerClasses.galleryIndex}>
                        {item.order_index}
                      </div>
                      <div className={mediaManagerClasses.galleryActions}>
                        <button
                          type="button"
                          disabled={isPending || idx === 0}
                          onClick={() => move(item.id, 'up')}
                          className={mediaManagerClasses.galleryButton}
                        >
                          {t('reorderUp')}
                        </button>
                        <button
                          type="button"
                          disabled={isPending || idx === arr.length - 1}
                          onClick={() => move(item.id, 'down')}
                          className={mediaManagerClasses.galleryButton}
                        >
                          {t('reorderDown')}
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => remove(item.id)}
                          className={mediaManagerClasses.galleryButton}
                        >
                          {t('remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className={mediaManagerClasses.galleryEmpty}>
              {t('emptyGallery')}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
