import { redirect } from 'next/navigation';
import { mockPlans } from '@/lib/mock-data/plans';
import { CheckoutPage } from '@/components/checkout/checkout-page';

interface CheckoutPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ plan?: string; coupon?: string }>;
}

export default async function CheckoutRoute({ params, searchParams }: CheckoutPageProps) {
  const { locale } = await params;
  const { plan: planId, coupon } = await searchParams;

  if (!planId) {
    redirect(`/${locale}/browse`);
  }

  const plan = mockPlans.find((p) => p.id === planId);

  if (!plan) {
    redirect(`/${locale}/browse`);
  }

  return <CheckoutPage plan={plan} couponFromUrl={coupon} />;
}
