import { redirect } from 'next/navigation';
import { DeliveryPage } from '@/components/delivery/delivery-page';

// TODO: Phase 4 production -- verify Payment Intent status via stripe.paymentIntents.retrieve(payment_intent) before showing success. See RESEARCH.md Pitfall 6.

interface SuccessPageProps {
  searchParams: Promise<{ payment_intent?: string; mock?: string; email?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { payment_intent, email } = await searchParams;

  // Prevent direct URL access without a payment_intent
  if (!payment_intent) {
    redirect('/en/checkout');
  }

  return <DeliveryPage paymentIntentId={payment_intent} email={email} />;
}
