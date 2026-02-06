import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

import {createSupabaseServerClientReadOnly} from '@/lib/supabase/server';

import {setPublishAction} from './actions';
import {DeleteAssetButton} from './DeleteAssetButton';

export const dynamic = 'force-dynamic';

export default async function AdminModelsPage({}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations('admin.models');

  const supabase = await createSupabaseServerClientReadOnly();
  const {data: assets, error} = await supabase
    .from('assets')
    .select('id,document_id,title,category,license_type,status,is_published,updated_at')
    .order('updated_at', {ascending: false});

  if (error) {
    return (
      <div className="border border-red-300 bg-red-50 p-4 font-doc text-[11px] uppercase tracking-[0.16em] text-red-900">
        {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h1 className="font-condensed text-[clamp(32px,4vw,52px)] leading-[0.9] uppercase tracking-[0.14em]">
          {t('title')}
        </h1>
        <Link
          href="/admin/models/new"
          className="ui-btn-primary"
        >
          {t('create')}
        </Link>
      </div>

      <div className="overflow-x-auto overflow-y-hidden border border-[color:var(--color-line)] bg-[var(--color-paper)]">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[160px_1fr_160px_120px_120px_320px] items-center bg-black">
            <div className="border-r border-white/20 px-4 py-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-white">
              {t('documentId')}
            </div>
            <div className="border-r border-white/20 px-4 py-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-white">
              {t('titleField')}
            </div>
            <div className="border-r border-white/20 px-4 py-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-white">
              {t('category')}
            </div>
            <div className="border-r border-white/20 px-4 py-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-white">
              {t('published')}
            </div>
            <div className="border-r border-white/20 px-4 py-3 font-condensed text-[12px] uppercase tracking-[0.18em] text-white">
              {t('status')}
            </div>
            <div className="px-4 py-3 text-right font-condensed text-[12px] uppercase tracking-[0.18em] text-white">
              ACTIONS
            </div>
          </div>

          {(assets ?? []).map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-[160px_1fr_160px_120px_120px_320px] items-center border-b border-[color:var(--color-line)] bg-[var(--color-surface)]"
            >
              <div className="border-r border-[color:var(--color-line)] px-4 py-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {a.document_id}
              </div>

              <Link
                href={`/admin/models/${a.id}`}
                className="border-r border-[color:var(--color-line)] px-4 py-3 font-doc text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink)] hover:underline"
              >
                {a.title}
              </Link>

              <div className="border-r border-[color:var(--color-line)] px-4 py-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {a.category ?? '—'}
              </div>
              <div className="border-r border-[color:var(--color-line)] px-4 py-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {a.is_published ? 'PUBLISHED' : '—'}
              </div>
              <div className="border-r border-[color:var(--color-line)] px-4 py-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {a.status ?? '—'}
              </div>

              <div className="flex justify-end gap-2 px-4 py-3">
                <form action={setPublishAction}>
                  <input type="hidden" name="asset_id" value={a.id} />
                  <input type="hidden" name="document_id" value={a.document_id} />
                  <input
                    type="hidden"
                    name="next_published"
                    value={a.is_published ? 'false' : 'true'}
                  />
                  <button
                    type="submit"
                    className="flex h-9 items-center justify-center border border-[color:var(--color-line)] bg-[var(--color-paper)] px-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-ink)] hover:bg-[color-mix(in_oklab,var(--color-paper),#000_6%)]"
                  >
                    {a.is_published ? t('unpublish') : t('publish')}
                  </button>
                </form>

                <DeleteAssetButton assetId={a.id} title={a.title} />

                <Link
                  href={`/admin/models/${a.id}`}
                  className="flex h-9 items-center justify-center border border-black bg-black px-3 font-doc text-[11px] uppercase tracking-[0.18em] text-white hover:bg-[color-mix(in_oklab,#000,#fff_10%)]"
                >
                  EDIT
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
