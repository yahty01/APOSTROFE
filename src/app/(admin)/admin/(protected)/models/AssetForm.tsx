'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useMemo, useTransition} from 'react';
import {useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {z} from 'zod';

import {useReportPending} from '@/lib/pending';

import {saveAssetAction} from './model-actions';
import {assetFormClasses} from './AssetForm.styles';

/**
 * Валидатор поля textarea, которое может быть пустым или содержать JSON.
 * Используется для `measurements` и `details`.
 */
function buildSchema(messages: {
  invalidJson: string;
  documentIdRequired: string;
  documentIdInvalid: string;
  titleRequired: string;
}) {
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
    }, messages.invalidJson);

  return z.object({
    document_id: z
      .string()
      .min(1, messages.documentIdRequired)
      .regex(/^[A-Za-z0-9_-]+$/, messages.documentIdInvalid),
    title: z.string().min(1, messages.titleRequired),
    description: z.string().optional(),
    category: z.string().optional(),
    license_type: z.string().optional(),
    status: z.string().optional(),
    measurements: jsonOrEmpty,
    details: jsonOrEmpty,
    is_published: z.boolean()
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

/**
 * Форма создания/редактирования ассета.
 * Используется на `/admin/models/new` и `/admin/models/[id]`, вызывает `saveAssetAction` и умеет выполнять `afterSave`.
 */
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
  useReportPending(isPending);

  const schema = useMemo(
    () =>
      buildSchema({
        invalidJson: t('errors.invalidJson'),
        documentIdRequired: t('errors.documentIdRequired'),
        documentIdInvalid: t('errors.documentIdInvalid'),
        titleRequired: t('errors.titleRequired')
      }),
    [t]
  );

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

  /**
   * Отправка формы: сохраняем ассет через server action, показываем toast и обновляем страницу.
   * При создании может редиректить на страницу редактирования (зависит от `redirectToEdit`).
   */
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
      className={assetFormClasses.form}
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <div className={assetFormClasses.grid2}>
        <div>
          <label className={assetFormClasses.label}>
            {tModels('documentId')}
          </label>
          <input
            {...form.register('document_id')}
            className={assetFormClasses.input}
            placeholder="my-model-001"
          />
          <p className={assetFormClasses.help}>
            {t('documentIdHelp')}
          </p>
          {form.formState.errors.document_id?.message ? (
            <p className={assetFormClasses.error}>
              {form.formState.errors.document_id.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className={assetFormClasses.label}>
            {tModels('titleField')}
          </label>
          <input
            {...form.register('title')}
            className={assetFormClasses.input}
            placeholder={tModels('titleField')}
          />
          <p className={assetFormClasses.help}>
            {t('titleHelp')}
          </p>
          {form.formState.errors.title?.message ? (
            <p className={assetFormClasses.error}>
              {form.formState.errors.title.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className={assetFormClasses.label}>
            {tModels('category')}
          </label>
          <input
            {...form.register('category')}
            className={assetFormClasses.input}
            placeholder="chairs"
          />
          <p className={assetFormClasses.help}>
            {t('categoryHelp')}
          </p>
        </div>

        <div>
          <label className={assetFormClasses.label}>
            {tModels('licenseType')}
          </label>
          <input
            {...form.register('license_type')}
            className={assetFormClasses.input}
            placeholder="CC-BY"
          />
          <p className={assetFormClasses.help}>
            {t('licenseHelp')}
          </p>
        </div>

        <div>
          <label className={assetFormClasses.label}>
            {tModels('status')}
          </label>
          <input
            {...form.register('status')}
            className={assetFormClasses.input}
            placeholder="DRAFT / READY / ..."
          />
          <p className={assetFormClasses.help}>
            {t('statusHelp')}
          </p>
        </div>

        <div className={assetFormClasses.checkboxWrap}>
          <label className={assetFormClasses.checkboxLabel}>
            <input
              type="checkbox"
              {...form.register('is_published')}
              className={assetFormClasses.checkboxInput}
            />
            {tModels('published')}
          </label>
          <p className={assetFormClasses.help}>
            {t('publishedHelp')}
          </p>
        </div>
      </div>

      <div>
        <label className={assetFormClasses.label}>
          {t('description')}
        </label>
        <textarea
          {...form.register('description')}
          rows={4}
          className={assetFormClasses.textarea}
        />
        <p className={assetFormClasses.help}>
          {t('descriptionHelp')}
        </p>
      </div>

      <div className={assetFormClasses.jsonGrid}>
        <div>
          <label className={assetFormClasses.label}>
            {t('measurements')}
          </label>
          <textarea
            {...form.register('measurements')}
            rows={8}
            className={assetFormClasses.textarea}
            placeholder='{"width_mm": 123, "height_mm": 456}'
          />
          <p className={assetFormClasses.help}>
            {t('measurementsHelp')}
          </p>
          {form.formState.errors.measurements?.message ? (
            <p className={assetFormClasses.error}>
              {form.formState.errors.measurements.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className={assetFormClasses.label}>
            {t('details')}
          </label>
          <textarea
            {...form.register('details')}
            rows={8}
            className={assetFormClasses.textarea}
            placeholder='{"polycount": 12000}'
          />
          <p className={assetFormClasses.help}>
            {t('detailsHelp')}
          </p>
          {form.formState.errors.details?.message ? (
            <p className={assetFormClasses.error}>
              {form.formState.errors.details.message}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={assetFormClasses.submit}
      >
        {isPending ? tCommon('saving') : tCommon('save')}
      </button>
    </form>
  );
}
