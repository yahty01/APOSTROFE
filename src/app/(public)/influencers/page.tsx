import {PublicRegistryPage} from '@/components/models/PublicRegistryPage';

export const dynamic = 'force-dynamic';

export default async function InfluencersPage({
  searchParams
}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <PublicRegistryPage
      searchParams={searchParams}
      config={{
        route: '/influencers',
        section: 'influencers',
        entityType: 'influencer',
        fields: ['name', 'topic', 'license', 'platforms'],
        filterColumn: 'influencer_topic',
        filterLabelKey: 'filters.influencerTopic',
        noResultsKey: 'noResults.influencers',
        mediaMode: 'image',
        detailBasePath: '/influencers'
      }}
    />
  );
}
