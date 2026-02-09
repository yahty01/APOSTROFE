'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useTransition} from 'react';
import {useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {z} from 'zod';

import {useReportPending} from '@/lib/pending';

import {saveMarqueeSettingsAction} from './actions';
import {marqueeFormClasses} from './MarqueeForm.styles';

/**
 * Схема client-side валидации формы.
 * Используется `react-hook-form` + `zodResolver`, чтобы ловить ошибки до отправки server action.
 */
const schema = z.object({
  enabled: z.boolean(),
  text_ru: z.string().optional(),
  text_en: z.string().optional(),
  speed: z.number().int().positive().nullable(),
  direction: z.enum(['left', 'right'])
});

type FormValues = z.infer<typeof schema>;

/**
 * Клиентская форма редактирования marquee.
 * Используется на `/admin/settings/marquee` и сохраняет настройки через server action.
 */
export function MarqueeForm({initialValues}: {initialValues: FormValues}) {
  const t = useTranslations('admin.marquee');
  const tCommon = useTranslations('common');
  const tToast = useTranslations('admin.toast');

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  useReportPending(isPending);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues
  });

  /**
   * Сохранение настроек: выполняем server action, показываем toast и обновляем данные на странице.
   */
  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const res = await saveMarqueeSettingsAction({
        ...values
      });
      if (!res.ok) {
        toast.error(res.error || tToast('error'));
        return;
      }
      toast.success(tToast('saved'));
      router.refresh();
    });
  }

  return (
    <form className={marqueeFormClasses.form} onSubmit={form.handleSubmit(onSubmit)}>
      <label className={marqueeFormClasses.checkboxLabel}>
        <input
          type="checkbox"
          {...form.register('enabled')}
          className={marqueeFormClasses.checkboxInput}
        />
        {tCommon('enabled')}
      </label>

      <div className={marqueeFormClasses.textGrid}>
        <div>
          <label className={marqueeFormClasses.label}>
            {t('textRu')}
          </label>
          <textarea
            {...form.register('text_ru')}
            rows={6}
            className={marqueeFormClasses.textarea}
          />
        </div>
        <div>
          <label className={marqueeFormClasses.label}>
            {t('textEn')}
          </label>
          <textarea
            {...form.register('text_en')}
            rows={6}
            className={marqueeFormClasses.textarea}
          />
        </div>
      </div>

      <div className={marqueeFormClasses.controlsGrid}>
        <div>
          <label className={marqueeFormClasses.label}>
            {t('speed')}
          </label>
          <input
            type="number"
            min={6}
            step={1}
            {...form.register('speed', {
              setValueAs: (v) => {
                if (v === '' || v == null) return null;
                const n = Number(v);
                return Number.isFinite(n) ? n : null;
              }
            })}
            className={marqueeFormClasses.speedInput}
            placeholder="20"
          />
          <p className={marqueeFormClasses.help}>
            {t('secondsPerLoop')}
          </p>
        </div>

        <div>
          <label className={marqueeFormClasses.label}>
            {t('direction')}
          </label>
          <select
            {...form.register('direction')}
            className={marqueeFormClasses.select}
          >
            <option value="left">{t('directionLeft')}</option>
            <option value="right">{t('directionRight')}</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className={marqueeFormClasses.submit}
      >
        {isPending ? tCommon('saving') : tCommon('save')}
      </button>
    </form>
  );
}
