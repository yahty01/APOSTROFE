import {localizeAsset, localizedAssetValue} from '@/lib/assets/localization';
import Link from 'next/link';
import {getLocale, getTranslations} from 'next-intl/server';

import {PendingFormStatusReporter} from '@/components/pending/PendingFormStatusReporter';
import {createSupabaseServerClientReadOnly} from '@/lib/supabase/server';

import {setPublishAction} from './actions';
import {DeleteAssetButton} from './DeleteAssetButton';
import {adminModelsPageClasses} from './page.styles';

export const dynamic = 'force-dynamic';

/**
 * Список ассетов в админке (`/admin/models`).
 * Загружает данные на сервере и рендерит таблицу с действиями publish/unpublish, edit и delete.
 */
export default async function AdminModelsPage({}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations('admin.models');
  const tCommon = await getTranslations('common');
  const locale = await getLocale();
  const tToast = await getTranslations('admin.toast');

  const supabase = await createSupabaseServerClientReadOnly();
  const {data: assets, error} = await supabase
    .from('assets')
    .select('id,document_id,title,details,model_type,license_type,status,is_published,updated_at')
    .eq('entity_type', 'model')
    .order('updated_at', {ascending: false});

  if (error) {
    return (
      <div className={adminModelsPageClasses.error}>
        {tToast('error')}
      </div>
    );
  }

  return (
    <div className={adminModelsPageClasses.root}>
      <div className={adminModelsPageClasses.header}>
        <h1 className={adminModelsPageClasses.title}>
          {t('title')}
        </h1>
        <Link
          href="/admin/models/new"
          className={adminModelsPageClasses.createLink}
        >
          {t('create')}
        </Link>
      </div>

      <div className={adminModelsPageClasses.tableWrap}>
        <div className={adminModelsPageClasses.tableInner}>
          <div className={adminModelsPageClasses.tableHeaderRow}>
            <div className={adminModelsPageClasses.headerCell}>
              {t('documentId')}
            </div>
            <div className={adminModelsPageClasses.headerCell}>
              {t('titleField')}
            </div>
            <div className={adminModelsPageClasses.headerCell}>
              {t('modelType')}
            </div>
            <div className={adminModelsPageClasses.headerCell}>
              {t('published')}
            </div>
            <div className={adminModelsPageClasses.headerCell}>
              {t('status')}
            </div>
            <div className={adminModelsPageClasses.headerCellLast}>
              {tCommon('actions')}
            </div>
          </div>

          {(assets ?? []).map((row) => localizeAsset(row, locale)).map((a) => (
            <div
              key={a.id}
              className={adminModelsPageClasses.row}
            >
              <div className={adminModelsPageClasses.cellMuted}>
                {a.document_id}
              </div>

              <Link
                href={`/admin/models/${a.id}`}
                className={adminModelsPageClasses.cellTitleLink}
              >
                {a.title}
              </Link>

              <div className={adminModelsPageClasses.cellMuted}>
                {localizedAssetValue(a.model_type, locale)}
              </div>
              <div className={adminModelsPageClasses.cellMuted}>
                {a.is_published ? t('publishedYes') : '—'}
              </div>
              <div className={adminModelsPageClasses.cellMuted}>
                {localizedAssetValue(a.status, locale)}
              </div>

              <div className={adminModelsPageClasses.actions}>
                <form action={setPublishAction}>
                  <PendingFormStatusReporter />
                  <input type="hidden" name="asset_id" value={a.id} />
                  <input type="hidden" name="document_id" value={a.document_id} />
                  <input type="hidden" name="entity_type" value="model" />
                  <input
                    type="hidden"
                    name="next_published"
                    value={a.is_published ? 'false' : 'true'}
                  />
                  <button
                    type="submit"
                    className={adminModelsPageClasses.actionButton}
                  >
                    {a.is_published ? t('unpublish') : t('publish')}
                  </button>
                </form>

                <DeleteAssetButton assetId={a.id} title={a.title} entityType="model" />

                <Link
                  href={`/admin/models/${a.id}`}
                  className={adminModelsPageClasses.actionEditLink}
                >
                  {tCommon('edit').toUpperCase()}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
