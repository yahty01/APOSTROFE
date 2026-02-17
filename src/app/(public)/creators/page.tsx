import {PublicRegistryPage} from '@/components/models/PublicRegistryPage';

export const dynamic = 'force-dynamic';

export default async function CreatorsPage({
  searchParams
}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <PublicRegistryPage
      searchParams={searchParams}
      config={{
        route: '/creators',
        section: 'creators',
        entityType: 'creator',
        fields: ['name', 'direction', 'license', 'status'],
        filterColumn: 'creator_direction',
        filterLabelKey: 'filters.creatorDirection',
        noResultsKey: 'noResults.creators',
        mediaMode: 'title',
        detailBasePath: '/creators'
      }}
    />
  );
}
