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
          <label className="block text-sm font-medium text-black/80">
            {tModels('documentId')}
          </label>
          <input
            {...form.register('document_id')}
            className="mt-1 h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="my-model-001"
          />
          <p className="mt-1 text-xs text-black/50">{t('documentIdHelp')}</p>
          {form.formState.errors.document_id?.message ? (
            <p className="mt-1 text-xs text-red-600">
              {form.formState.errors.document_id.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-black/80">
            {tModels('titleField')}
          </label>
          <input
            {...form.register('title')}
            className="mt-1 h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="Title"
          />
          <p className="mt-1 text-xs text-black/50">{t('titleHelp')}</p>
          {form.formState.errors.title?.message ? (
            <p className="mt-1 text-xs text-red-600">
              {form.formState.errors.title.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-black/80">
            {tModels('category')}
          </label>
          <input
            {...form.register('category')}
            className="mt-1 h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="chairs"
          />
          <p className="mt-1 text-xs text-black/50">{t('categoryHelp')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-black/80">
            {tModels('licenseType')}
          </label>
          <input
            {...form.register('license_type')}
            className="mt-1 h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="CC-BY"
          />
          <p className="mt-1 text-xs text-black/50">{t('licenseHelp')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-black/80">
            {tModels('status')}
          </label>
          <input
            {...form.register('status')}
            className="mt-1 h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="DRAFT / READY / ..."
          />
          <p className="mt-1 text-xs text-black/50">{t('statusHelp')}</p>
        </div>

        <div className="pt-8">
          <label className="flex items-center gap-2 text-sm text-black/80">
            <input
              type="checkbox"
              {...form.register('is_published')}
              className="h-4 w-4 rounded border-black/20"
            />
            {tModels('published')}
          </label>
          <p className="mt-1 text-xs text-black/50">{t('publishedHelp')}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-black/80">
          {t('description')}
        </label>
        <textarea
          {...form.register('description')}
          rows={4}
          className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
        />
        <p className="mt-1 text-xs text-black/50">{t('descriptionHelp')}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-black/80">
            {t('measurements')}
          </label>
          <textarea
            {...form.register('measurements')}
            rows={8}
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-black/10"
            placeholder='{"width_mm": 123, "height_mm": 456}'
          />
          <p className="mt-1 text-xs text-black/50">{t('measurementsHelp')}</p>
          {form.formState.errors.measurements?.message ? (
            <p className="mt-1 text-xs text-red-600">
              {form.formState.errors.measurements.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="block text-sm font-medium text-black/80">
            {t('details')}
          </label>
          <textarea
            {...form.register('details')}
            rows={8}
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 font-mono text-xs outline-none focus:ring-2 focus:ring-black/10"
            placeholder='{"polycount": 12000}'
          />
          <p className="mt-1 text-xs text-black/50">{t('detailsHelp')}</p>
          {form.formState.errors.details?.message ? (
            <p className="mt-1 text-xs text-red-600">
              {form.formState.errors.details.message}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-medium text-white hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? tCommon('saving') : tCommon('save')}
      </button>
    </form>
  );
}
