'use client';

import {useRouter} from 'next/navigation';
import {useTranslations} from 'next-intl';
import {useTransition} from 'react';
import {toast} from 'sonner';

import {useReportPending} from '@/lib/pending';

import {deleteAssetAction} from './actions';
import {deleteAssetButtonClasses} from './DeleteAssetButton.styles';

/**
 * Кнопка удаления ассета в админке.
 * Используется на `/admin/models` и `/admin/models/[id]`: показывает confirm и вызывает `deleteAssetAction`.
 */
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
  useReportPending(isPending);

  /**
   * Обрабатывает клик по "DELETE": подтверждение и выполнение server action в transition.
   * После успешного удаления возвращаем в список моделей.
   */
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
      className={deleteAssetButtonClasses.button}
    >
      {t('delete')}
    </button>
  );
}
