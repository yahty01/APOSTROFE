type AssetLike = {
  document_id: string;
  updated_at?: string | null;
  license_type?: string | null;
  status?: string | null;
  description?: string | null;
  category?: string | null;
  title?: string | null;
};

function formatIsoDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : value;
}

export function buildTelegramShareUrl(text: string, url?: string): string {
  const params = new URLSearchParams();
  params.set('text', text);
  if (url) params.set('url', url);
  return `https://t.me/share/url?${params.toString()}`;
}

export function buildLicenseRequestText(asset: AssetLike): string {
  const description = (asset.description || asset.title || '').trim() || '—';

  const lines: (string | null)[] = [
    'LICENSE REQUEST',
    `DOCUMENT_ID: ${asset.document_id}`,
    `TIMESTAMP: ${formatIsoDate(asset.updated_at)}`,
    `LICENSE: ${(asset.license_type || 'STANDARD').toUpperCase()}`,
    `STATUS: ${(asset.status || 'AVAILABLE').toUpperCase()}`,
    `DESCRIPTION: ${description}`,
    asset.category ? `CATEGORY: ${asset.category}` : null,
    asset.title ? `TITLE: ${asset.title}` : null
  ];

  return lines.filter(Boolean).join('\n');
}

export function buildRequestInfoText(asset: AssetLike): string {
  const lines: (string | null)[] = [
    'REQUEST INFO',
    `DOCUMENT_ID: ${asset.document_id}`,
    `TIMESTAMP: ${formatIsoDate(asset.updated_at)}`,
    `LICENSE: ${(asset.license_type || 'STANDARD').toUpperCase()}`,
    `STATUS: ${(asset.status || 'AVAILABLE').toUpperCase()}`
  ];

  return lines.filter(Boolean).join('\n');
}

export function buildGenericLicenseRequestText(): string {
  return ['LICENSE REQUEST', 'TYPE: GENERAL', 'SOURCE: /models'].join('\n');
}

