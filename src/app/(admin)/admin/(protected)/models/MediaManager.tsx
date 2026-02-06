'use client';

import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {useTransition} from 'react';
import {useTranslations} from 'next-intl';
import {toast} from 'sonner';

import {
  deleteMediaAction,
  moveGalleryMediaAction,
  uploadGalleryAction,
  uploadHeroAction
} from './media-actions';

export type AdminMediaItem = {
  id: string;
  path: string;
  url: string | null;
  kind: 'hero' | 'gallery';
  order_index: number;
};

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

  const MB = 1024 * 1024;
  const maxBytes = 10 * 1024 * 1024;
  const acceptImages = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

  const softWarnSingleBytes = 4 * MB;
  const softWarnTotalBytes = 15 * MB;

  function bytesToMb(bytes: number) {
    return Math.round((bytes / MB) * 10) / 10;
  }

  function validateFile(file: File): string | null {
    if (!file.type.startsWith('image/')) return t('errorOnlyImages');
    if (file.size > maxBytes) return t('errorTooLarge', {mb: 10});
    return null;
  }

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

  function move(mediaId: string, direction: 'up' | 'down') {
    startTransition(async () => {
      const res = await moveGalleryMediaAction({asset_id: assetId, media_id: mediaId, direction});
      if (!res.ok) toast.error(res.error || tToast('error'));
      router.refresh();
    });
  }

  function remove(mediaId: string) {
    startTransition(async () => {
      const res = await deleteMediaAction({asset_id: assetId, media_id: mediaId});
      if (!res.ok) toast.error(res.error || tToast('error'));
      else toast.success(tToast('saved'));
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <div className="ui-panel p-4">
        <div className="font-condensed text-[12px] uppercase tracking-[0.18em] text-[var(--color-ink)]">
          {t('howItWorksTitle')}
        </div>
        <div className="mt-3 space-y-1 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
          <div>{t('howItWorksFormats', {mb: 10})}</div>
          <div>{t('howItWorksPaths', {documentId})}</div>
          <div>{t('howItWorksPublish')}</div>
          <div>{t('storageNote')}</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-condensed text-xl uppercase tracking-[0.12em]">
            {t('hero')}
          </h2>
          <label className="flex h-10 cursor-pointer items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-4 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]">
            <input
              type="file"
              accept={acceptImages}
              className="hidden"
              disabled={isPending}
              onChange={(e) => onUploadHero(e.target.files?.[0] ?? null)}
            />
            {isPending ? tCommon('loading') : t('upload')}
          </label>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden border border-[color:var(--color-line)] bg-[var(--color-paper)]">
          {hero?.url ? (
            <Image
              src={hero.url}
              alt="Hero"
              fill
              className="object-contain object-center"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {t('emptyHero')}
            </div>
          )}
        </div>

        {hero ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => remove(hero.id)}
            className="flex h-9 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)] disabled:opacity-60"
          >
            {t('remove')}
          </button>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-condensed text-xl uppercase tracking-[0.12em]">
            {t('gallery')}
          </h2>
          <label className="flex h-10 cursor-pointer items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-4 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]">
            <input
              type="file"
              accept={acceptImages}
              multiple
              className="hidden"
              disabled={isPending}
              onChange={(e) => onUploadGallery(e.target.files)}
            />
            {isPending ? tCommon('loading') : t('upload')}
          </label>
        </div>

        {gallery.length ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gallery
              .slice()
              .sort((a, b) => a.order_index - b.order_index)
              .map((item, idx, arr) => (
                <div
                  key={item.id}
                  className="ui-panel p-3"
                >
                  <div className="relative aspect-square overflow-hidden border border-[color:var(--color-line)] bg-[var(--color-paper)]">
                    {item.url ? (
                      <Image
                        src={item.url}
                        alt={`Gallery ${idx + 1}`}
                        fill
                        className="object-contain object-center"
                        sizes="200px"
                      />
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="truncate font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                      {item.order_index}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={isPending || idx === 0}
                        onClick={() => move(item.id, 'up')}
                        className="flex h-8 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)] disabled:opacity-50"
                      >
                        {t('reorderUp')}
                      </button>
                      <button
                        type="button"
                        disabled={isPending || idx === arr.length - 1}
                        onClick={() => move(item.id, 'down')}
                        className="flex h-8 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)] disabled:opacity-50"
                      >
                        {t('reorderDown')}
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => remove(item.id)}
                        className="flex h-8 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)] disabled:opacity-50"
                      >
                        {t('remove')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="ui-panel p-8 text-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {t('emptyGallery')}
          </div>
        )}
      </div>
    </div>
  );
}
