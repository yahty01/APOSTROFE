import {redirect} from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminIndexPage({}: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  redirect('/admin/models');
}
