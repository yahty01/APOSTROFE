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
      <label className="flex items-center gap-2 text-sm text-black/80">
        <input
          type="checkbox"
          {...form.register('enabled')}
          className="h-4 w-4 rounded border-black/20"
        />
        {tCommon('enabled')}
      </label>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-black/80">
            {t('textRu')}
          </label>
          <textarea
            {...form.register('text_ru')}
            rows={6}
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black/80">
            {t('textEn')}
          </label>
          <textarea
            {...form.register('text_en')}
            rows={6}
            className="mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-black/80">
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
            className="mt-1 h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="20"
          />
          <p className="mt-1 text-xs text-black/50">Seconds per loop</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-black/80">
            {t('direction')}
          </label>
          <select
            {...form.register('direction')}
            className="mt-1 h-11 w-full rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
          >
            <option value="left">{t('directionLeft')}</option>
            <option value="right">{t('directionRight')}</option>
          </select>
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
