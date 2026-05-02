import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CouponsClient } from './coupons-client';

export default async function AdminCouponsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(`/${locale}/login?next=/${locale}/admin/coupons`);
  }

  if (user.app_metadata?.role !== 'admin') {
    notFound();
  }

  return <CouponsClient />;
}
