'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useCheckoutStore } from '@/stores/checkout';
import { STRIPE_MOCK_MODE } from '@/lib/stripe/client';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function MockPayButton() {
  const t = useTranslations('checkout');
  const { email, total_cents, payment_status, setPaymentStatus } = useCheckoutStore();
  const [processing, setProcessing] = useState(false);

  const totalFormatted = (total_cents / 100).toFixed(2);
  const isDisabled =
    !email ||
    !EMAIL_REGEX.test(email) ||
    payment_status === 'processing' ||
    payment_status === 'creating' ||
    processing;

  const handlePay = useCallback(async () => {
    if (isDisabled) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    setProcessing(true);
    setPaymentStatus('processing');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    window.location.href = `${window.location.origin}/en/checkout/success?payment_intent=pi_mock_${Date.now()}`;
  }, [isDisabled, setPaymentStatus]);

  return <PayButtonUI processing={processing} isDisabled={isDisabled} totalFormatted={totalFormatted} onClick={handlePay} />;
}

function RealPayButton() {
  const { useStripe, useElements } = require('@stripe/react-stripe-js') as typeof import('@stripe/react-stripe-js');
  const stripe = useStripe();
  const elements = useElements();
  const t = useTranslations('checkout');
  const { email, total_cents, payment_status, setPaymentStatus } = useCheckoutStore();
  const [processing, setProcessing] = useState(false);

  const totalFormatted = (total_cents / 100).toFixed(2);
  const isDisabled =
    !stripe || !elements ||
    !email ||
    !EMAIL_REGEX.test(email) ||
    payment_status === 'processing' ||
    payment_status === 'creating' ||
    processing;

  const handlePay = useCallback(async () => {
    if (isDisabled || !stripe || !elements) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    setProcessing(true);
    setPaymentStatus('processing');

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/en/checkout/success`,
          receipt_email: email,
        },
      });

      if (error) {
        let errorType: string;
        if (error.type === 'card_error' && error.decline_code) {
          errorType = 'declined';
        } else if (error.type === 'api_connection_error') {
          errorType = 'network';
        } else {
          errorType = 'generic';
        }
        setPaymentStatus('failed', errorType);
      }
    } catch {
      setPaymentStatus('failed', 'generic');
    } finally {
      setProcessing(false);
    }
  }, [stripe, elements, email, isDisabled, setPaymentStatus]);

  return <PayButtonUI processing={processing} isDisabled={isDisabled} totalFormatted={totalFormatted} onClick={handlePay} />;
}

function PayButtonUI({ processing, isDisabled, totalFormatted, onClick }: {
  processing: boolean;
  isDisabled: boolean;
  totalFormatted: string;
  onClick: () => void;
}) {
  const t = useTranslations('checkout');

  return (
    <>
      <div className="h-6" />
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 pb-[calc(16px+env(safe-area-inset-bottom))] bg-white/90 dark:bg-background-dark/90 backdrop-blur-sm border-t border-gray-100 dark:border-border-dark md:static md:bg-transparent md:backdrop-blur-none md:border-0 md:p-0 md:pb-0">
        <Button
          variant="primary"
          size="lg"
          onClick={onClick}
          disabled={isDisabled}
          className="w-full h-12"
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-[spin_0.8s_linear_infinite]" />
              Processing...
            </span>
          ) : (
            t('pay', { amount: totalFormatted })
          )}
        </Button>
      </div>
    </>
  );
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
export function PayButton() {
  return STRIPE_MOCK_MODE ? <MockPayButton /> : <RealPayButton />;
}
