'use client';

import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {useTransition} from 'react';
import {useTranslations} from 'next-intl';
import {toast} from 'sonner';

import {useReportPending} from '@/lib/pending';

import {
  deleteMediaAction,
  moveGalleryMediaAction,
  uploadGalleryAction,
  uploadHeroAction
} from './media-actions';
import {mediaManagerClasses} from './MediaManager.styles';

/**
 * UI-тип медиа-элемента для админки.
 * Заполняется на сервере (страница редактирования) и используется для рендера hero/gallery в `MediaManager`.
 */
export type AdminMediaItem = {
  id: string;
  path: string;
  url: string | null;
  kind: 'hero' | 'gallery';
  order_index: number;
};

/**
 * Управление медиа ассета: загрузка hero, загрузка/сортировка/удаление gallery.
 * Используется на странице `/admin/models/[id]` и вызывает server actions из `media-actions.ts`.
 */
export function MediaManager({
  assetId,
  documentId,
  hero,
  gallery
}: {
  assetId: string;
  documentId: string;
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

  /**
   * Загрузка hero-файла: валидируем, при необходимости предупреждаем про размер, вызываем `uploadHeroAction`.
   */
  function onUploadHero(file: File | null) {
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
      fd.set('file', file);
      const res = await uploadHeroAction(fd);
      if (!res.ok) toast.error(res.error || tToast('error'));
      else toast.success(tToast('saved'));
      router.refresh();
    });
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
      const res = await moveGalleryMediaAction({asset_id: assetId, media_id: mediaId, direction});
      if (!res.ok) toast.error(res.error || tToast('error'));
      router.refresh();
    });
  }

  /**
   * Удаляет hero/gallery элемент через server action и обновляет страницу.
   */
  function remove(mediaId: string) {
    startTransition(async () => {
      const res = await deleteMediaAction({asset_id: assetId, media_id: mediaId});
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
          <div>{t('howItWorksPublish')}</div>
          <div>{t('storageNote')}</div>
        </div>
      </div>

      <div className={mediaManagerClasses.section}>
        <div className={mediaManagerClasses.sectionHeader}>
          <h2 className={mediaManagerClasses.sectionTitle}>
            {t('hero')}
          </h2>
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
            className={mediaManagerClasses.removeHeroButton}
          >
            {t('remove')}
          </button>
        ) : null}
      </div>

      <div className={mediaManagerClasses.section}>
        <div className={mediaManagerClasses.sectionHeader}>
          <h2 className={mediaManagerClasses.sectionTitle}>
            {t('gallery')}
          </h2>
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
    </div>
  );
}
