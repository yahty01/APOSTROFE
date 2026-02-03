import Link from 'next/link';
import {getTranslations} from 'next-intl/server';

import {createSupabaseServerClientReadOnly} from '@/lib/supabase/server';

import {archiveAssetAction, setPublishAction} from './actions';

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
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <Link
          href="/admin/models/new"
          className="inline-flex h-10 items-center justify-center rounded-full bg-black px-4 text-sm font-medium text-white hover:bg-black/90"
        >
          {t('create')}
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
        <div className="grid grid-cols-[160px_1fr_160px_120px_120px_220px] gap-3 border-b border-black/10 px-4 py-3 text-xs font-medium text-black/60">
          <div>{t('documentId')}</div>
          <div>{t('titleField')}</div>
          <div>{t('category')}</div>
          <div>{t('published')}</div>
          <div>{t('status')}</div>
          <div className="text-right">Actions</div>
        </div>

        {(assets ?? []).map((a) => (
          <div
            key={a.id}
            className="grid grid-cols-[160px_1fr_160px_120px_120px_220px] items-center gap-3 border-b border-black/5 px-4 py-3 text-sm"
          >
            <div className="truncate font-mono text-xs text-black/70">
              {a.document_id}
            </div>

            <Link
              href={`/admin/models/${a.id}`}
              className="min-w-0 truncate font-medium text-black hover:underline"
            >
              {a.title}
            </Link>

            <div className="truncate text-black/70">{a.category ?? '—'}</div>
            <div className="text-black/70">{a.is_published ? '✅' : '—'}</div>
            <div className="truncate text-black/70">{a.status ?? '—'}</div>

            <div className="flex justify-end gap-2">
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
                  className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white px-3 text-xs hover:bg-black/5"
                >
                  {a.is_published ? t('unpublish') : t('publish')}
                </button>
              </form>

              <form action={archiveAssetAction}>
                <input type="hidden" name="asset_id" value={a.id} />
                <input type="hidden" name="document_id" value={a.document_id} />
                <button
                  type="submit"
                  className="inline-flex h-9 items-center justify-center rounded-full border border-black/10 bg-white px-3 text-xs hover:bg-black/5"
                >
                  {t('archive')}
                </button>
              </form>

              <Link
                href={`/admin/models/${a.id}`}
                className="inline-flex h-9 items-center justify-center rounded-full bg-black px-3 text-xs text-white hover:bg-black/90"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
