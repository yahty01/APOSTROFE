export type AssetEntityType = 'model' | 'creator' | 'influencer';
export type AssetEntitySection = 'models' | 'creators' | 'influencers';

export function getAssetEntitySection(entityType: AssetEntityType): AssetEntitySection {
  if (entityType === 'creator') return 'creators';
  if (entityType === 'influencer') return 'influencers';
  return 'models';
}

export function getAdminBasePathForEntity(entityType: AssetEntityType) {
  return `/admin/${getAssetEntitySection(entityType)}` as const;
}

export function getPublicBasePathForEntity(entityType: AssetEntityType) {
  if (entityType === 'creator') return '/creators' as const;
  if (entityType === 'influencer') return '/influencers' as const;
  return '/models' as const;
}
