import { redirect } from 'next/navigation';
import { mockPlans } from '@/lib/mock-data/plans';
import { CheckoutPage } from '@/components/checkout/checkout-page';

interface CheckoutPageProps {
  searchParams: Promise<{ plan?: string; coupon?: string }>;
}

export default async function CheckoutRoute({ searchParams }: CheckoutPageProps) {
  const { plan: planId, coupon } = await searchParams;

  if (!planId) {
    redirect('/en/browse');
  }

  const plan = mockPlans.find((p) => p.id === planId);

  if (!plan) {
    redirect('/en/browse');
  }

  return <CheckoutPage plan={plan} couponFromUrl={coupon} />;
}
