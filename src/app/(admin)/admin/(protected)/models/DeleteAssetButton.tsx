'use client';

import {useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {useTransition} from 'react';
import {toast} from 'sonner';

import {deleteAssetAction} from './actions';

export function DeleteAssetButton({
  assetId,
  title
}: {
  assetId: string;
  title: string;
}) {
  const t = useTranslations('admin.models');
  const tToast = useTranslations('admin.toast');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    const ok = window.confirm(t('deleteConfirm', {title}));
    if (!ok) return;

    startTransition(async () => {
      const fd = new FormData();
      fd.set('asset_id', assetId);
      const res = await deleteAssetAction(fd);
      if (!res.ok) {
        toast.error(res.error || tToast('error'));
        return;
      }

      if (res.warning) toast(tToast('warningWithDetails', {details: res.warning}));
      toast.success(tToast('deleted'));
      router.replace('/admin/models');
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={onDelete}
      className="flex h-9 items-center justify-center border border-red-300 bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] text-red-800 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {t('delete')}
    </button>
  );
}
