import {getLocale} from 'next-intl/server';
import {httpUrl, propertyRows} from '@/lib/assets/model-properties';
import {modelDetailPageClasses as styles} from '@/app/(public)/models/[document_id]/page.styles';

export async function PropertyGrid({value}: {value: unknown}) {
  const rows = propertyRows(value, await getLocale());
  if (!rows.length) return null;
  return (
    <dl className={styles.kvGrid}>
      {rows.map((row, index) => (
        <div key={`${row.label}-${index}`} className={styles.kvItem}>
          {row.label ? <dt className={styles.kvKey}>{row.label}</dt> : null}
          <dd className={styles.kvValue}>
            {httpUrl(row.value) ? <a href={httpUrl(row.value)!} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:opacity-60">{row.value}</a> : row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
