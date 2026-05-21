'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ExpressCheckoutElement } from '@stripe/react-stripe-js';
import { useCheckoutStore } from '@/stores/checkout';
import type { StripeExpressCheckoutElementReadyEvent, StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js';

export function ExpressCheckout() {
  const t = useTranslations('checkout.express');
  const setPaymentStatus = useCheckoutStore((s) => s.setPaymentStatus);
  const [available, setAvailable] = useState(false);

  const handleReady = (event: StripeExpressCheckoutElementReadyEvent) => {
    if (event.availablePaymentMethods) {
      setAvailable(true);
    }
  };

  const handleConfirm = (_event: StripeExpressCheckoutElementConfirmEvent) => {
    setPaymentStatus('processing');
    // Stripe handles the payment confirmation via the Elements provider
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
