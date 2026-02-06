'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';

import {AssetForm} from '../AssetForm';
import {uploadGalleryAction, uploadHeroAction} from '../media-actions';

const acceptImages = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

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

  function bytesToMb(bytes: number) {
    return Math.round((bytes / MB) * 10) / 10;
  }

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
    <div className="space-y-6">
      <div className="ui-panel p-6">
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

      <div className="ui-panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-condensed text-xl uppercase tracking-[0.12em]">
              {tMedia('title')}
            </div>
            <div className="mt-2 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
              {tMedia('preUploadHelp')}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setHeroFile(null);
              setGalleryFiles([]);
            }}
            className="flex h-9 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]"
          >
            {tMedia('clearSelection')}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {tMedia('hero')}
            </div>
            <label className="flex h-10 cursor-pointer items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-4 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]">
              <input
                type="file"
                accept={acceptImages}
                className="hidden"
                onChange={(e) => setHeroFile(e.target.files?.[0] ?? null)}
              />
              {tMedia('selectFiles')}
            </label>
            <div className="font-doc text-[11px] tracking-[0.06em] text-[var(--color-muted)]">
              {heroFile ? (
                <div className="space-y-1">
                  <div className="truncate">{heroFile.name}</div>
                  <div>
                    {tMedia('sizeLabel', {mb: bytesToMb(heroFile.size)})}
                  </div>
                  {heroFile.size >= softWarnSingleBytes ? (
                    <div className="text-amber-700">
                      {tMedia('warningLargeFile', {mb: bytesToMb(heroFile.size)})}
                    </div>
                  ) : null}
                </div>
              ) : (
                tMedia('noFilesSelected')
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {tMedia('gallery')}
            </div>
            <label className="flex h-10 cursor-pointer items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-4 font-doc text-[11px] uppercase tracking-[0.18em] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]">
              <input
                type="file"
                accept={acceptImages}
                multiple
                className="hidden"
                onChange={(e) => setGalleryFiles(Array.from(e.target.files ?? []))}
              />
              {tMedia('selectFiles')}
            </label>
            <div className="font-doc text-[11px] tracking-[0.06em] text-[var(--color-muted)]">
              {galleryFiles.length ? (() => {
                const totalBytes = galleryFiles.reduce((sum, file) => sum + file.size, 0);
                const showWarn =
                  totalBytes >= softWarnTotalBytes ||
                  galleryFiles.some((f) => f.size >= softWarnSingleBytes);

                return (
                  <div className="space-y-1">
                    <div>{tMedia('filesSelected', {count: galleryFiles.length})}</div>
                    <div>{tMedia('sizeTotalLabel', {mb: bytesToMb(totalBytes)})}</div>
                    {showWarn ? (
                      <div className="text-amber-700">
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

        <div className="mt-4 font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {t('documentIdHelp')}
        </div>
      </div>
    </div>
  );
}
