import {PublicRegistryPage} from '@/components/models/PublicRegistryPage';

export const dynamic = 'force-dynamic';

export default async function ModelsPage({
  searchParams
}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <PublicRegistryPage
      searchParams={searchParams}
      config={{
        route: '/models',
        section: 'models',
        entityType: 'model',
        fields: ['name', 'createdAt', 'license', 'modelType'],
        filterColumn: 'model_type',
        filterLabelKey: 'filters.modelType',
        noResultsKey: 'noResults.models',
        mediaMode: 'image',
        detailBasePath: '/models'
      }}
    />
  );
}
