import { redirect } from 'next/navigation';
import { DeliveryPage } from '@/components/delivery/delivery-page';

interface SuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ payment_intent?: string; mock?: string; email?: string }>;
}

export default async function SuccessPage({ params, searchParams }: SuccessPageProps) {
  const { locale } = await params;
  const { payment_intent, email } = await searchParams;

  // Prevent direct URL access without a payment_intent
  if (!payment_intent) {
    redirect(`/${locale}/browse`);
  }

  // Validate payment_intent format (Stripe IDs start with pi_)
  const isValidFormat = /^pi_[a-zA-Z0-9_]+$/.test(payment_intent) ||
    (process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true' && payment_intent.startsWith('mock_'));

  if (!isValidFormat) {
    redirect(`/${locale}/browse`);
  }

  return <DeliveryPage paymentIntentId={payment_intent} email={email} />;
}
