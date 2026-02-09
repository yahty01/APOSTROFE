import type {SupabaseClient} from '@supabase/supabase-js';

import type {Database} from './database.types';

/**
 * Генерирует временную (signed) ссылку на файл в Supabase Storage с трансформациями (resize/quality).
 * Используется на публичных и админских страницах для безопасного показа изображений без публичного бакета.
 * Возвращает `null`, если файл недоступен или Supabase вернул ошибку.
 */
export async function createSignedImageUrl(
  supabase: SupabaseClient<Database>,
  path: string,
  options: {
    width?: number;
    height?: number;
    resize?: 'cover' | 'contain' | 'fill';
    quality?: number;
  }
) {
  const {data, error} = await supabase.storage
    .from('assets')
    .createSignedUrl(path, 60 * 60, {
      transform: {
        width: options.width,
        height: options.height,
        resize: options.resize,
        quality: options.quality
      }
    });

  if (error || !data) return null;
  return data.signedUrl;
}
