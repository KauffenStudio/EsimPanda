'use client';

import { useCallback, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useCheckoutStore } from '@/stores/checkout';
import { useCurrencyStore } from '@/stores/currency';
import { formatPrice } from '@/lib/currency/rates';
import { STRIPE_MOCK_MODE } from '@/lib/stripe/client';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The Stripe confirmPayment return_url is the ONLY way email flows from the
// checkout form to the delivery / provisioning step — the order row was
// created with an empty email at checkout-mount time (before the user typed
// anything). Without this, /api/delivery/provision receives email=undefined,
// the fallback `claimed.email` is '', and sendDeliveryEmail's `if (email)`
// gate fails, so the customer never gets their eSIM email.
function buildSuccessUrl(origin: string, locale: string, email: string): string {
  return `${origin}/${locale}/checkout/success?email=${encodeURIComponent(email)}`;
}

function MockPayButton() {
  const { email, total_cents, payment_status, setPaymentStatus } = useCheckoutStore();
  const currency = useCurrencyStore((s) => s.currency);
  const locale = useLocale();
  const [processing, setProcessing] = useState(false);

  // Display total in the currency the user picked (same as OrderSummary). The
  // earlier version printed `$X.XX` regardless of selection, so a customer
  // seeing "€18.99" in the summary then saw "$22.05" on the button — looked
  // like a bug, plus the "pay" i18n key embedded a literal '$' that would
  // render as "$€18.99" once the formatter was attached.
  const totalFormatted = formatPrice(total_cents, currency);
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
    const successUrl = buildSuccessUrl(window.location.origin, locale, email);
    window.location.href = `${successUrl}&payment_intent=pi_mock_${Date.now()}`;
  }, [isDisabled, setPaymentStatus, locale, email]);

  return <PayButtonUI processing={processing} isDisabled={isDisabled} totalFormatted={totalFormatted} onClick={handlePay} />;
}

function RealPayButton() {
  // useStripe/useElements MUST come from the same module instance that the
  // <Elements> provider in checkout-page.tsx uses. A lazy require() here loaded
  // a second copy with its own React context, so the hook could not see the
  // provider — "Could not find Elements context" crashed the whole checkout.
  const stripe = useStripe();
  const elements = useElements();
  const { email, total_cents, payment_status, setPaymentStatus } = useCheckoutStore();
  const currency = useCurrencyStore((s) => s.currency);
  const locale = useLocale();
  const [processing, setProcessing] = useState(false);

  const totalFormatted = formatPrice(total_cents, currency);
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
          return_url: buildSuccessUrl(window.location.origin, locale, email),
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
  }, [stripe, elements, email, isDisabled, setPaymentStatus, locale]);

  return <PayButtonUI processing={processing} isDisabled={isDisabled} totalFormatted={totalFormatted} onClick={handlePay} />;
}

function PayButtonUI({ processing, isDisabled, totalFormatted, onClick }: {
  processing: boolean;
  isDisabled: boolean;
  totalFormatted: string;
  onClick: () => void;
}) {
  const t = useTranslations('checkout');
  const email = useCheckoutStore((s) => s.email);
  const [showEmailHint, setShowEmailHint] = useState(false);

  const handleClick = () => {
    if (isDisabled && (!email || !EMAIL_REGEX.test(email))) {
      setShowEmailHint(true);
      const emailInput = document.querySelector('input[type="email"]');
      if (emailInput) {
        emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (emailInput as HTMLInputElement).focus();
      }
      return;
    }
    setShowEmailHint(false);
    onClick();
  };

  return (
    <>
      <div className="h-6" />
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 pb-[calc(16px+env(safe-area-inset-bottom))] bg-white/90 dark:bg-background-dark/90 backdrop-blur-sm border-t border-gray-100 dark:border-border-dark md:static md:bg-transparent md:backdrop-blur-none md:border-0 md:p-0 md:pb-0">
        {showEmailHint && (
          <p className="text-xs text-destructive text-center mb-2">
            {t('email_required_hint')}
          </p>
        )}
        <Button
          variant="primary"
          size="lg"
          onClick={handleClick}
          disabled={processing}
          className="w-full h-12"
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-[spin_0.8s_linear_infinite]" />
              {t('processing')}
            </span>
          ) : (
            t('pay', { amount: totalFormatted })
          )}
        </Button>
      </div>
    </>
  );
}

export function PayButton() {
  return STRIPE_MOCK_MODE ? <MockPayButton /> : <RealPayButton />;
}
