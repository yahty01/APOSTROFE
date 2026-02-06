'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useTransition} from 'react';
import {useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {z} from 'zod';

import {saveAssetAction} from './model-actions';

const jsonOrEmpty = z
  .string()
  .optional()
  .refine((value) => {
    const trimmed = (value ?? '').trim();
    if (!trimmed) return true;
    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      return false;
    }
  }, 'Invalid JSON');

const schema = z.object({
  document_id: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_-]+$/, 'Only letters, numbers, _ and -'),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  license_type: z.string().optional(),
  status: z.string().optional(),
  measurements: jsonOrEmpty,
  details: jsonOrEmpty,
  is_published: z.boolean()
});

type FormValues = z.infer<typeof schema>;

export function AssetForm({
  assetId,
  initialValues,
  redirectToEdit = true,
  afterSave
}: {
  assetId?: string;
  initialValues: Partial<FormValues>;
  redirectToEdit?: boolean;
  afterSave?: (
    result: {id: string; document_id: string},
    values: FormValues
  ) => Promise<void> | void;
}) {
  const t = useTranslations('admin.modelForm');
  const tModels = useTranslations('admin.models');
  const tCommon = useTranslations('common');
  const tToast = useTranslations('admin.toast');

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      document_id: '',
      title: '',
      description: '',
      category: '',
      license_type: '',
      status: '',
      measurements: '',
      details: '',
      is_published: false,
      ...initialValues
    }
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const res = await saveAssetAction({
        id: assetId,
        ...values
      });

      if (!res.ok) {
        toast.error(res.error || tToast('error'));
        return;
      }

      toast.success(tToast('saved'));
      try {
        await afterSave?.({id: res.id, document_id: res.document_id}, values);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : tToast('error'));
      }

      if (redirectToEdit) {
        router.push(`/admin/models/${res.id}`);
      }
      router.refresh();
    });
  }

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {tModels('documentId')}
          </label>
          <input
            {...form.register('document_id')}
            className="ui-input mt-2 h-11 font-doc text-[11px] tracking-[0.14em]"
            placeholder="my-model-001"
          />
          <p className="mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {t('documentIdHelp')}
          </p>
          {form.formState.errors.document_id?.message ? (
            <p className="mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-red-700">
              {form.formState.errors.document_id.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {tModels('titleField')}
          </label>
          <input
            {...form.register('title')}
            className="ui-input mt-2 h-11 font-doc text-[11px] tracking-[0.14em]"
            placeholder="Title"
          />
          <p className="mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {t('titleHelp')}
          </p>
          {form.formState.errors.title?.message ? (
            <p className="mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-red-700">
              {form.formState.errors.title.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {tModels('category')}
          </label>
          <input
            {...form.register('category')}
            className="ui-input mt-2 h-11 font-doc text-[11px] tracking-[0.14em]"
            placeholder="chairs"
          />
          <p className="mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {t('categoryHelp')}
          </p>
        </div>

        <div>
          <label className="block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {tModels('licenseType')}
          </label>
          <input
            {...form.register('license_type')}
            className="ui-input mt-2 h-11 font-doc text-[11px] tracking-[0.14em]"
            placeholder="CC-BY"
          />
          <p className="mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {t('licenseHelp')}
          </p>
        </div>

        <div>
          <label className="block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {tModels('status')}
          </label>
          <input
            {...form.register('status')}
            className="ui-input mt-2 h-11 font-doc text-[11px] tracking-[0.14em]"
            placeholder="DRAFT / READY / ..."
          />
          <p className="mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {t('statusHelp')}
          </p>
        </div>

        <div className="pt-8">
          <label className="flex items-center gap-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            <input
              type="checkbox"
              {...form.register('is_published')}
              className="h-4 w-4 border border-[color:var(--color-line)] bg-[var(--color-paper)]"
            />
            {tModels('published')}
          </label>
          <p className="mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {t('publishedHelp')}
          </p>
        </div>
      </div>

      <div>
        <label className="block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {t('description')}
        </label>
        <textarea
          {...form.register('description')}
          rows={4}
          className="ui-textarea mt-2 font-doc text-[11px] tracking-[0.14em]"
        />
        <p className="mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {t('descriptionHelp')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {t('measurements')}
          </label>
          <textarea
            {...form.register('measurements')}
            rows={8}
            className="ui-textarea mt-2 font-doc text-[11px] tracking-[0.14em]"
            placeholder='{"width_mm": 123, "height_mm": 456}'
          />
          <p className="mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {t('measurementsHelp')}
          </p>
          {form.formState.errors.measurements?.message ? (
            <p className="mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-red-700">
              {form.formState.errors.measurements.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {t('details')}
          </label>
          <textarea
            {...form.register('details')}
            rows={8}
            className="ui-textarea mt-2 font-doc text-[11px] tracking-[0.14em]"
            placeholder='{"polycount": 12000}'
          />
          <p className="mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {t('detailsHelp')}
          </p>
          {form.formState.errors.details?.message ? (
            <p className="mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-red-700">
              {form.formState.errors.details.message}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="ui-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? tCommon('saving') : tCommon('save')}
      </button>
    </form>
  );
}
