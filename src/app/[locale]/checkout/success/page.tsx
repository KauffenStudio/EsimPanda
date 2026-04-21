import { redirect } from 'next/navigation';
import { PaymentSuccess } from '@/components/checkout/payment-success';

// TODO: Phase 4 production -- verify Payment Intent status via stripe.paymentIntents.retrieve(payment_intent) before showing success. See RESEARCH.md Pitfall 6.

interface SuccessPageProps {
  searchParams: Promise<{ payment_intent?: string; mock?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { payment_intent, mock } = await searchParams;

  // Prevent direct URL access without a payment_intent
  if (!payment_intent) {
    redirect('/en/checkout');
  }

  // In dev/mock mode, accept mock=true for testing
  // In production, the payment_intent would be verified server-side
  const _isMock = mock === 'true';

  // Generate stable order ID from payment_intent so it doesn't change on refresh
  const orderId = `ORD-${payment_intent.slice(-8).toUpperCase()}`;

  return <PaymentSuccess orderId={orderId} />;
}
