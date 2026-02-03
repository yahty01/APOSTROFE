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
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
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

      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold tracking-tight">{tMedia('title')}</div>
            <div className="mt-1 text-xs text-black/60">{tMedia('preUploadHelp')}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              setHeroFile(null);
              setGalleryFiles([]);
            }}
            className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white px-3 text-xs hover:bg-black/5"
          >
            {tMedia('clearSelection')}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium text-black/80">{tMedia('hero')}</div>
            <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm hover:bg-black/5">
              <input
                type="file"
                accept={acceptImages}
                className="hidden"
                onChange={(e) => setHeroFile(e.target.files?.[0] ?? null)}
              />
              {tMedia('selectFiles')}
            </label>
            <div className="text-xs text-black/60">
              {heroFile ? heroFile.name : tMedia('noFilesSelected')}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-black/80">{tMedia('gallery')}</div>
            <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white px-4 text-sm hover:bg-black/5">
              <input
                type="file"
                accept={acceptImages}
                multiple
                className="hidden"
                onChange={(e) => setGalleryFiles(Array.from(e.target.files ?? []))}
              />
              {tMedia('selectFiles')}
            </label>
            <div className="text-xs text-black/60">
              {galleryFiles.length ? (
                <span>
                  {tMedia('filesSelected', {count: galleryFiles.length})}
                </span>
              ) : (
                <span>{tMedia('noFilesSelected')}</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-black/50">{t('documentIdHelp')}</div>
      </div>
    </div>
  );
}
