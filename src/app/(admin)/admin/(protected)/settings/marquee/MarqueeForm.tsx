'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {useTransition} from 'react';
import {useForm} from 'react-hook-form';
import {toast} from 'sonner';
import {z} from 'zod';

import {saveMarqueeSettingsAction} from './actions';

const schema = z.object({
  enabled: z.boolean(),
  text_ru: z.string().optional(),
  text_en: z.string().optional(),
  speed: z.number().int().positive().nullable(),
  direction: z.enum(['left', 'right'])
});

type FormValues = z.infer<typeof schema>;

export function MarqueeForm({initialValues}: {initialValues: FormValues}) {
  const t = useTranslations('admin.marquee');
  const tCommon = useTranslations('common');
  const tToast = useTranslations('admin.toast');

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues
  });

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
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
      <label className="flex items-center gap-3 font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
        <input
          type="checkbox"
          {...form.register('enabled')}
          className="h-4 w-4 border border-[color:var(--color-line)] bg-[var(--color-paper)]"
        />
        {tCommon('enabled')}
      </label>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {t('textRu')}
          </label>
          <textarea
            {...form.register('text_ru')}
            rows={6}
            className="ui-textarea mt-2 font-doc text-[11px] tracking-[0.06em]"
          />
        </div>
        <div>
          <label className="block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {t('textEn')}
          </label>
          <textarea
            {...form.register('text_en')}
            rows={6}
            className="ui-textarea mt-2 font-doc text-[11px] tracking-[0.06em]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
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
            className="ui-input mt-2 h-11 font-doc text-[11px] tracking-[0.06em]"
            placeholder="20"
          />
          <p className="mt-2 font-doc text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            SECONDS PER LOOP
          </p>
        </div>

        <div>
          <label className="block font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            {t('direction')}
          </label>
          <select
            {...form.register('direction')}
            className="ui-select mt-2 h-11 font-doc text-[11px] uppercase tracking-[0.18em]"
          >
            <option value="left">{t('directionLeft')}</option>
            <option value="right">{t('directionRight')}</option>
          </select>
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
