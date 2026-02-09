export const dynamic = 'force-dynamic';

/**
 * Внешний layout сегмента `(admin)`.
 * Сейчас не добавляет обёрток, но оставлен как точка расширения для будущих глобальных админских настроек.
 */
export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
  params: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <>{children}</>;
}
