'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useMemo, useTransition} from 'react';
import {useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {z} from 'zod';

import {
  getAdminBasePathForEntity,
  getAssetEntitySection,
  type AssetEntityType
} from '@/lib/assets/entity';
import {useReportPending} from '@/lib/pending';

import {saveAssetAction} from './model-actions';
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
    title: z.string().min(1, messages.titleRequired),
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

  /**
   * Отправка формы: сохраняем ассет через server action, показываем toast и обновляем страницу.
   * При создании может редиректить на страницу редактирования (зависит от `redirectToEdit`).
   */
  function onSubmit(values: FormValues) {
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

  return (
    <form
      className={assetFormClasses.form}
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <div className={assetFormClasses.grid2}>
        <div>
          <label className={assetFormClasses.label}>
            {tEntity('documentId')}
          </label>
          <div className={assetFormClasses.readonlyValue}>
            {assetId ? documentIdValue || '—' : t('documentIdAutoValue')}
          </div>
          <p className={assetFormClasses.help}>
            {assetId ? t('documentIdReadonlyHelp') : t('documentIdAutoHelp')}
          </p>
        </div>

        <div>
          <label className={assetFormClasses.label}>
            {tEntity('titleField')}
          </label>
          <input
            {...form.register('title')}
            className={assetFormClasses.input}
            placeholder={tEntity('titleField')}
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
            {entityType === 'model'
              ? tEntity('modelType')
              : entityType === 'creator'
                ? tEntity('direction')
                : tEntity('topic')}
          </label>
          <input
            {...form.register(
              entityType === 'model'
                ? 'model_type'
                : entityType === 'creator'
                  ? 'creator_direction'
                  : 'influencer_topic'
            )}
            className={assetFormClasses.input}
            placeholder={
              entityType === 'model'
                ? '3d / avatar / ...'
                : entityType === 'creator'
                  ? 'music / fashion / ...'
                  : 'music / sport / ...'
            }
          />
          <p className={assetFormClasses.help}>
            {entityType === 'model'
              ? t('modelTypeHelp')
              : entityType === 'creator'
                ? t('directionHelp')
                : t('topicHelp')}
          </p>
        </div>

        <div>
          <label className={assetFormClasses.label}>
            {tEntity('licenseType')}
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
            {entityType === 'influencer' ? tEntity('platforms') : tEntity('status')}
          </label>
          <input
            {...form.register(
              entityType === 'influencer' ? 'influencer_platforms' : 'status'
            )}
            className={assetFormClasses.input}
            placeholder={
              entityType === 'influencer'
                ? 'instagram, youtube, tiktok'
                : 'DRAFT / READY / ...'
            }
          />
          <p className={assetFormClasses.help}>
            {entityType === 'influencer' ? t('platformsHelp') : t('statusHelp')}
          </p>
        </div>

        <div className={assetFormClasses.checkboxWrap}>
          <label className={assetFormClasses.checkboxLabel}>
            <input
              type="checkbox"
              {...form.register('is_published')}
              className={assetFormClasses.checkboxInput}
            />
            {tEntity('published')}
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

      {entityType === 'influencer' ? (
        <div className={assetFormClasses.grid2}>
          <div>
            <label className={assetFormClasses.label}>
              {tEntity('instagramUrl')}
            </label>
            <input
              {...form.register('influencer_instagram_url')}
              className={assetFormClasses.input}
              placeholder="https://instagram.com/username"
            />
            <p className={assetFormClasses.help}>
              {t('socialUrlHelp')}
            </p>
            {form.formState.errors.influencer_instagram_url?.message ? (
              <p className={assetFormClasses.error}>
                {form.formState.errors.influencer_instagram_url.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className={assetFormClasses.label}>
              {tEntity('youtubeUrl')}
            </label>
            <input
              {...form.register('influencer_youtube_url')}
              className={assetFormClasses.input}
              placeholder="https://youtube.com/@channel"
            />
            <p className={assetFormClasses.help}>
              {t('socialUrlHelp')}
            </p>
            {form.formState.errors.influencer_youtube_url?.message ? (
              <p className={assetFormClasses.error}>
                {form.formState.errors.influencer_youtube_url.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className={assetFormClasses.label}>
              {tEntity('tiktokUrl')}
            </label>
            <input
              {...form.register('influencer_tiktok_url')}
              className={assetFormClasses.input}
              placeholder="https://tiktok.com/@username"
            />
            <p className={assetFormClasses.help}>
              {t('socialUrlHelp')}
            </p>
            {form.formState.errors.influencer_tiktok_url?.message ? (
              <p className={assetFormClasses.error}>
                {form.formState.errors.influencer_tiktok_url.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className={assetFormClasses.label}>
              {tEntity('telegramUrl')}
            </label>
            <input
              {...form.register('influencer_telegram_url')}
              className={assetFormClasses.input}
              placeholder="https://t.me/username"
            />
            <p className={assetFormClasses.help}>
              {t('socialUrlHelp')}
            </p>
            {form.formState.errors.influencer_telegram_url?.message ? (
              <p className={assetFormClasses.error}>
                {form.formState.errors.influencer_telegram_url.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className={assetFormClasses.label}>
              {tEntity('vkUrl')}
            </label>
            <input
              {...form.register('influencer_vk_url')}
              className={assetFormClasses.input}
              placeholder="https://vk.com/username"
            />
            <p className={assetFormClasses.help}>
              {t('socialUrlHelp')}
            </p>
            {form.formState.errors.influencer_vk_url?.message ? (
              <p className={assetFormClasses.error}>
                {form.formState.errors.influencer_vk_url.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className={assetFormClasses.label}>
              {tEntity('yandexMusicUrl')}
            </label>
            <input
              {...form.register('influencer_yandex_music_url')}
              className={assetFormClasses.input}
              placeholder="https://music.yandex.ru/..."
            />
            <p className={assetFormClasses.help}>
              {t('socialUrlHelp')}
            </p>
            {form.formState.errors.influencer_yandex_music_url?.message ? (
              <p className={assetFormClasses.error}>
                {form.formState.errors.influencer_yandex_music_url.message}
              </p>
            ) : null}
          </div>

          <div>
            <label className={assetFormClasses.label}>
              {tEntity('spotifyUrl')}
            </label>
            <input
              {...form.register('influencer_spotify_url')}
              className={assetFormClasses.input}
              placeholder="https://open.spotify.com/..."
            />
            <p className={assetFormClasses.help}>
              {t('socialUrlHelp')}
            </p>
            {form.formState.errors.influencer_spotify_url?.message ? (
              <p className={assetFormClasses.error}>
                {form.formState.errors.influencer_spotify_url.message}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {entityType === 'model' ? (
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
      ) : null}

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
