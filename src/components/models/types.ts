import type {AssetEntityType} from '@/lib/assets/entity';
export type {AssetEntityType} from '@/lib/assets/entity';

export type AssetFieldKey =
  | 'name'
  | 'createdAt'
  | 'license'
  | 'modelType'
  | 'direction'
  | 'status'
  | 'topic'
  | 'platforms';

export type AssetMediaMode = 'image' | 'title';

/**
 * Нормализованный формат элемента каталога для публичного UI.
 * Собирается на сервере (registry pages) и прокидывается в `AssetsTable` / `AssetCards`.
 */
export type AssetListItem = {
  id: string;
  entity_type: AssetEntityType;
  document_id: string;
  title: string;
  description: string | null;
  license_type: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  model_type: string | null;
  creator_direction: string | null;
  influencer_topic: string | null;
  influencer_platforms: string | null;
  preview_url: string | null;
};
