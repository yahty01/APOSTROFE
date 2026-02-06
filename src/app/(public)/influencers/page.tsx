import {getTranslations} from 'next-intl/server';

export const dynamic = 'force-dynamic';

export default async function InfluencersPage({}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations('public');

  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <h1 className="font-condensed text-[clamp(48px,6vw,72px)] leading-[0.88] uppercase tracking-[0.12em]">
          INFLUENCERS’
        </h1>
        <p className="max-w-3xl font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          REGISTRY SECTION — {t('comingSoon')}.
        </p>
      </header>

      <div className="ui-panel p-10 text-center font-doc text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
        {t('comingSoon')}
      </div>
    </div>
  );
}
