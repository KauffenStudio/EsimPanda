import { redirect } from 'next/navigation';
import { getPlanById } from '@/lib/db/destinations';
import { CheckoutPage } from '@/components/checkout/checkout-page';

interface CheckoutPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plan?: string; coupon?: string }>;
}

export default async function CheckoutRoute({ params, searchParams }: CheckoutPageProps) {
  const { locale } = await params;
  const { plan: planId, coupon } = await searchParams;

  // No plan selected at all — back to browse, no notice (not a stale-link case).
  if (!planId) {
    redirect(`/${locale}/browse`);
  }

  // Resolve the plan from Supabase by real plan ID (CHK-06). An unknown/stale
  // ID resolves to null → browse with a dismissable plan-unavailable notice.
  const plan = await getPlanById(planId);

  if (!plan) {
    redirect(`/${locale}/browse?notice=plan-unavailable`);
  }

  return <CheckoutPage plan={plan} couponFromUrl={coupon} />;
}
