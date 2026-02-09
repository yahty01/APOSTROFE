'use client';

import {useTranslations} from 'next-intl';

import {systemStatusClasses} from './SystemStatus.styles';

/**
 * Небольшой "индикатор системы" в шапке.
 * Сейчас значения статичны (заглушка), но компонент выделен отдельно для будущего подключения реальных метрик.
 */
export function SystemStatus() {
  const t = useTranslations('common');

  return (
    <div className={systemStatusClasses.root}>
      <div>{t('systemOnline')}</div>
      <div>{t('assetsCount', {count: 1420})}</div>
    </div>
  );
}
