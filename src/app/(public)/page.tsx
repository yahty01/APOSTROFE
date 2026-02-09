import {redirect} from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * Корень публичного сегмента — просто редиректим в каталог моделей.
 * Используется как entrypoint для `/`.
 */
export default function Page() {
  redirect('/models');
}
