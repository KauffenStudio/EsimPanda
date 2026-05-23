'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'motion/react';
import {
  ExpressCheckoutElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useCheckoutStore } from '@/stores/checkout';
import type {
  StripeExpressCheckoutElementReadyEvent,
  StripeExpressCheckoutElementConfirmEvent,
} from '@stripe/stripe-js';

export function ExpressCheckout() {
  const t = useTranslations('checkout.express');
  const locale = useLocale();
  const stripe = useStripe();
  const elements = useElements();
  const setPaymentStatus = useCheckoutStore((s) => s.setPaymentStatus);
  const storedEmail = useCheckoutStore((s) => s.email);
  const [available, setAvailable] = useState(false);

  const handleReady = (event: StripeExpressCheckoutElementReadyEvent) => {
    if (event.availablePaymentMethods) {
      setAvailable(true);
    }
  };

  // CRITICAL: previously this only flipped a local status flag. The
  // ExpressCheckoutElement does NOT auto-confirm — when the wallet UI returns
  // (after Face ID / Touch ID / wallet authentication) Stripe expects us to
  // explicitly call confirmPayment, otherwise the PaymentIntent stays in
  // 'requires_confirmation' forever and the customer is never charged. The
  // user's most-recent report ("can't pay with Apple Pay") was this bug.
  const handleConfirm = async (event: StripeExpressCheckoutElementConfirmEvent) => {
    if (!stripe || !elements) {
      setPaymentStatus('failed', 'generic');
      return;
    }
    setPaymentStatus('processing');

    // ExpressCheckoutElement may surface a billing email from the wallet (Apple
    // Pay returns it when the user has the option enabled). Prefer that over a
    // blank stored email so the receipt actually reaches the buyer.
    const walletEmail = event.billingDetails?.email ?? '';
    const email = (walletEmail || storedEmail || '').trim();

    try {
      // Email must travel via the return_url so it flows through the success
      // page → DeliveryPage → /api/delivery/provision → sendDeliveryEmail.
      // Otherwise the customer's eSIM email never gets sent (the order was
      // created at checkout-mount time with an empty email field).
      const successUrl = email
        ? `${window.location.origin}/${locale}/checkout/success?email=${encodeURIComponent(email)}`
        : `${window.location.origin}/${locale}/checkout/success`;
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: successUrl,
          receipt_email: email || undefined,
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
    }
  };

  // ExpressCheckoutElement MUST stay mounted for its onReady event to fire —
  // that event is what tells us whether any wallet (Apple Pay / Google Pay) is
  // available. Returning null before it mounts (the previous bug) meant
  // `available` could never flip true, so express checkout never appeared.
  // When no wallet is available the element simply renders nothing.
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: available ? 1 : 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      aria-hidden={!available}
    >
      {available && (
        <p className="text-sm text-gray-400 dark:text-gray-600 uppercase tracking-wide mb-2">
          {t('title')}
        </p>
      )}
      <ExpressCheckoutElement
        onReady={handleReady}
        onConfirm={handleConfirm}
        options={{
          paymentMethods: {
            applePay: 'auto',
            googlePay: 'auto',
            paypal: 'auto',
          },
        }}
      />
    </motion.div>
  );
}
