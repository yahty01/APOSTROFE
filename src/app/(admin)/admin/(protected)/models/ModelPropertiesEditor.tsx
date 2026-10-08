'use client';

import {useId, useRef, useState} from 'react';
import {useLocale, useTranslations} from 'next-intl';
import {hasProperties, httpUrl, isPropertyObject, socialPlatformForKey, socialPlatforms} from '@/lib/assets/model-properties';
import {assetFormClasses as styles} from './AssetForm.styles';

type Row = {id: number; key: string; value: unknown; error?: boolean};

export function ModelPropertiesEditor({value, onChange, onValidityChange, label, withSocial = false}: {
  value: string;
  onChange: (value: string) => void;
  onValidityChange: (valid: boolean) => void;
  label: string;
  withSocial?: boolean;
}) {
  const t = useTranslations('admin.modelForm');
  const locale = useLocale();
  const fieldId = useId();
  const nextId = useRef(10000);
  const [rows, setRows] = useState<Row[]>(() => {
    try {
      const data = value.trim() ? JSON.parse(value) : {};
      return isPropertyObject(data) ? Object.entries(data).map(([key, entry], id) => ({id, key, value: entry})) : [];
    } catch { return []; }
  });
  const [advanced, setAdvanced] = useState(() => {
    try { return Boolean(value.trim()) && !isPropertyObject(JSON.parse(value)); }
    catch { return true; }
  });
  const [error, setError] = useState('');

  function update(next: Row[]) {
    setRows(next);
    const keys = next.map((row) => row.key.trim()).filter(Boolean);
    const invalid = new Set(keys).size !== keys.length || next.some((row) => row.error || (!row.key.trim() && hasProperties(row.value)));
    setError(invalid ? t('propertyError') : '');
    onValidityChange(!invalid);
    if (!invalid) onChange(JSON.stringify(Object.fromEntries(next.filter((row) => row.key.trim()).map((row) => [row.key.trim(), row.value]))));
  }

  function updateSocial(key: string, label: string, url: string) {
    const next = rows.filter((row) => socialPlatformForKey(row.key)?.key !== key);
    if (url.trim()) next.push({id: nextId.current++, key: label, value: url.trim(), error: !httpUrl(url)});
    update(next);
  }

  return (
    <fieldset className="min-w-0 space-y-4 border-t border-[var(--color-line)] pt-5">
      <legend className="px-0 font-doc text-sm uppercase tracking-[0.1em]">{label}</legend>
      {advanced ? (
        <>
          <label htmlFor={`${fieldId}-json`} className={styles.label}>{t('advancedJson')}</label>
          <textarea id={`${fieldId}-json`} value={value} rows={8} className={styles.textarea} onChange={(event) => {
            onChange(event.target.value);
            onValidityChange(true);
          }} />
          <button type="button" className="ui-btn-outline" onClick={() => {
            try {
              const parsed = value.trim() ? JSON.parse(value) : {};
              if (!isPropertyObject(parsed)) { setError(t('propertyError')); return; }
              update(Object.entries(parsed).map(([key, entry]) => ({id: nextId.current++, key, value: entry})));
              setAdvanced(false);
            } catch { setError(t('errors.invalidJson')); }
          }}>{t('simpleFields')}</button>
        </>
      ) : (
        <>
          {withSocial ? (
            <div className="space-y-3">
              <h3 className={styles.label}>{t('socialLinks')}</h3>
              <div className={styles.grid2}>
                {socialPlatforms.map((platform) => {
                  const entry = rows.find((row) => socialPlatformForKey(row.key)?.key === platform.key);
                  return (
                    <div key={platform.key} className="min-w-0">
                      <label htmlFor={`${fieldId}-${platform.key}`} className={`${styles.label} flex items-center gap-2`}>
                        <span aria-hidden="true" className="h-4 w-4 bg-current" style={{mask: `url(/social/${platform.key}.svg) center / contain no-repeat`}} />
                        {locale === 'ru' && platform.key === 'yandex-music' ? 'Яндекс Музыка' : platform.label}
                      </label>
                      <input id={`${fieldId}-${platform.key}`} type="url" inputMode="url" value={typeof entry?.value === 'string' ? entry.value : ''} placeholder="https://…" className={styles.input} onChange={(event) => updateSocial(platform.key, platform.label, event.target.value)} />
                    </div>
                  );
                })}
              </div>
              <p className={styles.help}>{t('socialUrlHelp')}</p>
            </div>
          ) : null}
          <div className="space-y-3">
            {rows.filter((row) => !withSocial || !socialPlatformForKey(row.key)).map((row) => {
              const simpleArray = Array.isArray(row.value) && row.value.every((item) => typeof item === 'string');
              const isComplex = typeof row.value === 'object' && row.value !== null && !simpleArray;
              return (
                <div key={row.id} className="grid min-w-0 grid-cols-1 gap-3 border border-[var(--color-line)] bg-[var(--color-paper)] p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
                  <div className="min-w-0">
                    <label htmlFor={`${fieldId}-${row.id}-key`} className={styles.label}>{t('propertyName')}</label>
                    <input id={`${fieldId}-${row.id}-key`} value={row.key} className={styles.input} onChange={(event) => update(rows.map((entry) => entry.id === row.id ? {...entry, key: event.target.value} : entry))} />
                  </div>
                  <div className="min-w-0">
                    <label htmlFor={`${fieldId}-${row.id}-value`} className={styles.label}>{t('propertyValue')}</label>
                    {typeof row.value === 'boolean' ? (
                      <select id={`${fieldId}-${row.id}-value`} value={String(row.value)} className={styles.input} onChange={(event) => update(rows.map((entry) => entry.id === row.id ? {...entry, value: event.target.value === 'true'} : entry))}>
                        <option value="true">{t('yes')}</option><option value="false">{t('no')}</option>
                      </select>
                    ) : (
                      <textarea id={`${fieldId}-${row.id}-value`} rows={2} className={styles.textarea} defaultValue={simpleArray ? (row.value as string[]).join('\n') : isComplex ? JSON.stringify(row.value) : String(row.value ?? '')} onChange={(event) => {
                        let value: unknown = event.target.value;
                        let error = false;
                        if (simpleArray) value = event.target.value.split('\n');
                        else if (isComplex) { try { value = JSON.parse(event.target.value); } catch { error = true; value = row.value; } }
                        else if (typeof row.value === 'number') { const number = Number(event.target.value); value = event.target.value.trim() && Number.isFinite(number) ? number : event.target.value; }
                        update(rows.map((entry) => entry.id === row.id ? {...entry, value, error} : entry));
                      }} />
                    )}
                    {simpleArray ? <p className={styles.help}>{t('listHelp')}</p> : null}
                  </div>
                  <button type="button" aria-label={`${t('removeProperty')}: ${row.key}`} className="ui-btn-outline self-end" onClick={() => update(rows.filter((entry) => entry.id !== row.id))}>×</button>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="ui-btn-outline" onClick={() => update([...rows, {id: nextId.current++, key: '', value: ''}])}>{t('addProperty')}</button>
            <button type="button" className="ui-btn-outline" onClick={() => setAdvanced(true)}>{t('advancedJson')}</button>
          </div>
        </>
      )}
      {error ? <p role="alert" className={styles.error}>{error}</p> : null}
    </fieldset>
  );
}
