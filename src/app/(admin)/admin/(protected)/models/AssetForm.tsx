'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useMemo, useState, useTransition} from 'react';
import {useForm, useWatch} from 'react-hook-form';
import {toast} from 'sonner';
import {z} from 'zod';

import {
  getAdminBasePathForEntity,
  getAssetEntitySection,
  type AssetEntityType
} from '@/lib/assets/entity';
import {englishFormFields} from '@/lib/assets/translation-form';
import {useReportPending} from '@/lib/pending';

import {saveAssetAction} from './model-actions';
import {ModelPropertiesEditor} from './ModelPropertiesEditor';
import {assetFormClasses} from './AssetForm.styles';

/**
 * Схема валидации полей формы ассета.
 * JSON-поля (`measurements`, `details`) допускают пустое значение или валидный JSON,
 * URL-поля инфлюенсера — пустое значение или валидный `http/https` URL.
 */
function buildSchema(messages: {
  invalidJson: string;
  invalidUrl: string;
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

  const urlOrEmpty = z
    .string()
    .optional()
    .refine((value) => {
      const trimmed = (value ?? '').trim();
      if (!trimmed) return true;
      try {
        const url = new URL(trimmed);
        return url.protocol === 'http:' || url.protocol === 'https:';
      } catch {
        return false;
      }
    }, messages.invalidUrl);

  return z.object({
    title: z.string().trim().min(1, messages.titleRequired),
    description: z.string().optional(),
    model_type: z.string().optional(),
    creator_direction: z.string().optional(),
    influencer_topic: z.string().optional(),
    influencer_platforms: z.string().optional(),
    influencer_instagram_url: urlOrEmpty,
    influencer_youtube_url: urlOrEmpty,
    influencer_tiktok_url: urlOrEmpty,
    influencer_telegram_url: urlOrEmpty,
    influencer_vk_url: urlOrEmpty,
    influencer_yandex_music_url: urlOrEmpty,
    influencer_spotify_url: urlOrEmpty,
    license_type: z.string().optional(),
    status: z.string().optional(),
    measurements: jsonOrEmpty,
    details: jsonOrEmpty,
    ...englishFormFields,
    measurements_en: jsonOrEmpty,
    details_en: jsonOrEmpty,
    is_published: z.boolean()
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;
type AssetFormInitialValues = Partial<FormValues> & {document_id?: string};

/**
 * Форма создания/редактирования ассета.
 * Используется в разделах `/admin/models`, `/admin/creators`, `/admin/influencers`.
 * Вызывает `saveAssetAction` и умеет выполнять `afterSave`.
 */
export function AssetForm({
  assetId,
  entityType = 'model',
  redirectBasePath,
  initialValues,
  redirectToEdit = true,
  afterSave
}: {
  assetId?: string;
  entityType?: AssetEntityType;
  redirectBasePath?: string;
  initialValues: AssetFormInitialValues;
  redirectToEdit?: boolean;
  afterSave?: (
    result: {id: string; document_id: string; entity_type: AssetEntityType},
    values: FormValues
  ) => Promise<void> | void;
}) {
  const t = useTranslations('admin.modelForm');
  const tEntity = useTranslations(`admin.${getAssetEntitySection(entityType)}`);
  const tCommon = useTranslations('common');
  const tToast = useTranslations('admin.toast');
  const basePath = redirectBasePath ?? getAdminBasePathForEntity(entityType);

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [propertyValidity, setPropertyValidity] = useState({measurements: true, details: true, measurements_en: true, details_en: true});
  useReportPending(isPending);

  const schema = useMemo(
    () =>
      buildSchema({
        invalidJson: t('errors.invalidJson'),
        invalidUrl: t('errors.invalidUrl'),
        titleRequired: t('errors.titleRequired')
      }),
    [t]
  );

  const documentIdValue = (initialValues.document_id ?? '').trim();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...Object.fromEntries(Object.keys(englishFormFields).map((key) => [key, initialValues[key as keyof FormValues] ?? ''])),
      title: initialValues.title ?? '',
      description: initialValues.description ?? '',
      model_type: initialValues.model_type ?? '',
      creator_direction: initialValues.creator_direction ?? '',
      influencer_topic: initialValues.influencer_topic ?? '',
      influencer_platforms: initialValues.influencer_platforms ?? '',
      influencer_instagram_url: initialValues.influencer_instagram_url ?? '',
      influencer_youtube_url: initialValues.influencer_youtube_url ?? '',
      influencer_tiktok_url: initialValues.influencer_tiktok_url ?? '',
      influencer_telegram_url: initialValues.influencer_telegram_url ?? '',
      influencer_vk_url: initialValues.influencer_vk_url ?? '',
      influencer_yandex_music_url: initialValues.influencer_yandex_music_url ?? '',
      influencer_spotify_url: initialValues.influencer_spotify_url ?? '',
      license_type: initialValues.license_type ?? '',
      status: initialValues.status ?? '',
      measurements: initialValues.measurements ?? '',
      details: initialValues.details ?? '',
      is_published: initialValues.is_published ?? false
    }
  });

  const [measurementsValue, detailsValue, measurementsEn, detailsEn] = useWatch({control: form.control, name: ['measurements', 'details', 'measurements_en', 'details_en']});

  /**
   * Отправка формы: сохраняем ассет через server action, показываем toast и обновляем страницу.
   * При создании может редиректить на страницу редактирования (зависит от `redirectToEdit`).
   */
  function onSubmit(values: FormValues) {
    if (entityType === 'model' && Object.values(propertyValidity).some((valid) => !valid)) {
      toast.error(t('propertyError'));
      return;
    }
    startTransition(async () => {
      const res = await saveAssetAction({
        id: assetId,
        entity_type: entityType,
        ...values
      });

      if (!res.ok) {
        toast.error(res.error || tToast('error'));
        return;
      }

      toast.success(tToast('saved'));
      try {
        await afterSave?.(
          {id: res.id, document_id: res.document_id, entity_type: res.entity_type},
          values
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : tToast('error'));
      }

      if (redirectToEdit) {
        router.push(`${basePath}/${res.id}`);
      }
      router.refresh();
    });
  }

  const classification = entityType === 'model' ? 'model_type' : entityType === 'creator' ? 'creator_direction' : 'influencer_topic';
  const classificationLabel = entityType === 'model' ? tEntity('modelType') : entityType === 'creator' ? tEntity('direction') : tEntity('topic');
  const statusField = entityType === 'influencer' ? 'influencer_platforms' : 'status';

  function textField(name: keyof FormValues, label: string, multiline = false, required = false) {
    const id = `asset-${name}`;
    const english = name.endsWith('_en');
    const error = form.formState.errors[name]?.message;
    return (
      <div className={multiline ? 'min-w-0 sm:col-span-2' : 'min-w-0'} key={name}>
        <label htmlFor={id} className={assetFormClasses.label}>{label}{required ? ' *' : ''}</label>
        {multiline ? <textarea id={id} {...form.register(name)} rows={4} className={assetFormClasses.textarea} />
          : <input id={id} {...form.register(name)} lang={english ? 'en' : 'ru'} className={assetFormClasses.input} />}
        {error ? <p role="alert" className={assetFormClasses.error}>{error}</p> : null}
      </div>
    );
  }

  function languageSection(language: 'ru' | 'en') {
    const suffix = language === 'en' ? '_en' : '';
    const field = (name: string) => `${name}${suffix}` as keyof FormValues;
    const measurementsKey = field('measurements') as 'measurements' | 'measurements_en';
    const detailsKey = field('details') as 'details' | 'details_en';
    return (
      <fieldset className="min-w-0 space-y-6 border border-[var(--color-line)] p-4 md:p-6" lang={language}>
        <legend className="px-2 font-doc text-sm uppercase tracking-[0.1em]">{t(language === 'ru' ? 'russianContent' : 'englishContent')}</legend>
        <p className={assetFormClasses.help}>{t(language === 'ru' ? 'russianHelp' : 'englishHelp')}</p>
        <div className={assetFormClasses.grid2}>
          {textField(field('title'), tEntity('titleField'), false, language === 'ru')}
          {textField(field(classification), classificationLabel)}
          {textField(field('license_type'), tEntity('licenseType'))}
          {textField(field(statusField), entityType === 'influencer' ? tEntity('platforms') : tEntity('status'))}
          {textField(field('description'), t('description'), true)}
        </div>
        {entityType === 'model' ? <div className="space-y-6">
          <ModelPropertiesEditor
            label={t('measurements')}
            value={(language === 'ru' ? measurementsValue : measurementsEn) ?? ''}
            onChange={(value) => form.setValue(measurementsKey, value, {shouldDirty: true})}
            onValidityChange={(valid) => setPropertyValidity((previous) => ({...previous, [measurementsKey]: valid}))}
          />
          <ModelPropertiesEditor
            label={language === 'ru' ? t('details') : t('translatedDetails')}
            value={(language === 'ru' ? detailsValue : detailsEn) ?? ''}
            withSocial={language === 'ru'}
            onChange={(value) => form.setValue(detailsKey, value, {shouldDirty: true})}
            onValidityChange={(valid) => setPropertyValidity((previous) => ({...previous, [detailsKey]: valid}))}
          />
          {form.formState.errors[measurementsKey]?.message || form.formState.errors[detailsKey]?.message ? <p role="alert" className={assetFormClasses.error}>{t('errors.invalidJson')}</p> : null}
        </div> : null}
      </fieldset>
    );
  }

  const socialFields = ['instagram', 'youtube', 'tiktok', 'telegram', 'vk', 'yandex_music', 'spotify'] as const;
  const socialLabels = ['instagramUrl', 'youtubeUrl', 'tiktokUrl', 'telegramUrl', 'vkUrl', 'yandexMusicUrl', 'spotifyUrl'] as const;
  return (
    <form className={assetFormClasses.form} onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className={assetFormClasses.grid2}>
        <div>
          <span className={assetFormClasses.label}>{tEntity('documentId')}</span>
          <div className={assetFormClasses.readonlyValue}>{assetId ? documentIdValue || '—' : t('documentIdAutoValue')}</div>
          <p className={assetFormClasses.help}>{assetId ? t('documentIdReadonlyHelp') : t('documentIdAutoHelp')}</p>
        </div>
        <div className={assetFormClasses.checkboxWrap}>
          <label className={assetFormClasses.checkboxLabel}>
            <input type="checkbox" {...form.register('is_published')} className={assetFormClasses.checkboxInput} />
            {tEntity('published')}
          </label>
          <p className={assetFormClasses.help}>{t('publishedHelp')}</p>
        </div>
      </div>
      {languageSection('ru')}
      {languageSection('en')}
      <p className={assetFormClasses.help}>{t('sharedMediaHelp')}</p>
      {entityType === 'influencer' ? <fieldset className="min-w-0 space-y-4 border-t border-[var(--color-line)] pt-5">
        <legend className={assetFormClasses.label}>{t('socialLinks')}</legend>
        <div className={assetFormClasses.grid2}>{socialFields.map((platform, index) => {
          const name = `influencer_${platform}_url` as keyof FormValues;
          return <div key={name} className="min-w-0">
            <label htmlFor={`asset-${name}`} className={assetFormClasses.label}>{tEntity(socialLabels[index])}</label>
            <input id={`asset-${name}`} type="url" {...form.register(name)} className={assetFormClasses.input} placeholder="https://…" />
            {form.formState.errors[name]?.message ? <p className={assetFormClasses.error}>{form.formState.errors[name]?.message}</p> : null}
          </div>;
        })}</div>
        <p className={assetFormClasses.help}>{t('socialUrlHelp')}</p>
      </fieldset> : null}
      <button type="submit" disabled={isPending} className={assetFormClasses.submit}>{isPending ? tCommon('saving') : tCommon('save')}</button>
    </form>
  );
}
