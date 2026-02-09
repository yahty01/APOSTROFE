/**
 * Нормализованный формат элемента каталога для публичного UI.
 * Собирается на сервере (`/models`) и прокидывается в `AssetsTable` / `AssetCards`.
 */
export type AssetListItem = {
  id: string;
  document_id: string;
  title: string;
  description: string | null;
  category: string | null;
  license_type: string | null;
  status: string | null;
  updated_at: string;
  preview_url: string | null;
};
