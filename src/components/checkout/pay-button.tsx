'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useCheckoutStore } from '@/stores/checkout';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function PayButton() {
  const t = useTranslations('checkout');
  const stripe = useStripe();
  const elements = useElements();
  const { email, total_cents, payment_status, setPaymentStatus } = useCheckoutStore();
  const [processing, setProcessing] = useState(false);

  const totalFormatted = (total_cents / 100).toFixed(2);
  const isDisabled =
    !stripe ||
    !elements ||
    !email ||
    !EMAIL_REGEX.test(email) ||
    payment_status === 'processing' ||
    payment_status === 'creating' ||
    processing;

  const handlePay = useCallback(async () => {
    if (!stripe || !elements || isDisabled) return;

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
      // If no error, Stripe redirects to return_url
    } catch {
      setPaymentStatus('failed', 'generic');
    } finally {
      setProcessing(false);
    }
  }, [stripe, elements, email, isDisabled, setPaymentStatus]);

  return (
    <>
      {/* Spacer for non-mobile */}
      <div className="h-6" />

      {/* Mobile sticky wrapper */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 pb-[calc(16px+env(safe-area-inset-bottom))] bg-white/90 backdrop-blur-sm border-t border-gray-100 md:static md:bg-transparent md:backdrop-blur-none md:border-0 md:p-0 md:pb-0">
        <Button
          variant="primary"
          size="lg"
          onClick={handlePay}
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
