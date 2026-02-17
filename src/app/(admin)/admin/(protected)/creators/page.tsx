import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

import {PendingFormStatusReporter} from '@/components/pending/PendingFormStatusReporter';
import {createSupabaseServerClientReadOnly} from '@/lib/supabase/server';

import {setPublishAction} from '../models/actions';
import {DeleteAssetButton} from '../models/DeleteAssetButton';
import {adminModelsPageClasses} from '../models/page.styles';

export const dynamic = 'force-dynamic';

export default async function AdminCreatorsPage({}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations('admin.creators');
  const tCommon = await getTranslations('common');

  const supabase = await createSupabaseServerClientReadOnly();
  const {data: assets, error} = await supabase
    .from('assets')
    .select(
      'id,document_id,title,creator_direction,license_type,status,is_published,updated_at'
    )
    .eq('entity_type', 'creator')
    .order('updated_at', {ascending: false});

  if (error) {
    return <div className={adminModelsPageClasses.error}>{error.message}</div>;
  }

  return (
    <div className={adminModelsPageClasses.root}>
      <div className={adminModelsPageClasses.header}>
        <h1 className={adminModelsPageClasses.title}>{t('title')}</h1>
        <Link href="/admin/creators/new" className={adminModelsPageClasses.createLink}>
          {t('create')}
        </Link>
      </div>

      <div className={adminModelsPageClasses.tableWrap}>
        <div className={adminModelsPageClasses.tableInner}>
          <div className={adminModelsPageClasses.tableHeaderRow}>
            <div className={adminModelsPageClasses.headerCell}>{t('documentId')}</div>
            <div className={adminModelsPageClasses.headerCell}>{t('titleField')}</div>
            <div className={adminModelsPageClasses.headerCell}>{t('direction')}</div>
            <div className={adminModelsPageClasses.headerCell}>{t('published')}</div>
            <div className={adminModelsPageClasses.headerCell}>{t('status')}</div>
            <div className={adminModelsPageClasses.headerCellLast}>{tCommon('actions')}</div>
          </div>

          {(assets ?? []).map((a) => (
            <div key={a.id} className={adminModelsPageClasses.row}>
              <div className={adminModelsPageClasses.cellMuted}>{a.document_id}</div>

              <Link
                href={`/admin/creators/${a.id}`}
                className={adminModelsPageClasses.cellTitleLink}
              >
                {a.title}
              </Link>

              <div className={adminModelsPageClasses.cellMuted}>
                {a.creator_direction ?? '—'}
              </div>
              <div className={adminModelsPageClasses.cellMuted}>
                {a.is_published ? t('publishedYes') : '—'}
              </div>
              <div className={adminModelsPageClasses.cellMuted}>{a.status ?? '—'}</div>

              <div className={adminModelsPageClasses.actions}>
                <form action={setPublishAction}>
                  <PendingFormStatusReporter />
                  <input type="hidden" name="asset_id" value={a.id} />
                  <input type="hidden" name="document_id" value={a.document_id} />
                  <input type="hidden" name="entity_type" value="creator" />
                  <input
                    type="hidden"
                    name="next_published"
                    value={a.is_published ? 'false' : 'true'}
                  />
                  <button type="submit" className={adminModelsPageClasses.actionButton}>
                    {a.is_published ? t('unpublish') : t('publish')}
                  </button>
                </form>

                <DeleteAssetButton assetId={a.id} title={a.title} entityType="creator" />

                <Link
                  href={`/admin/creators/${a.id}`}
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
