'use client';

import { useState } from 'react';
import { PaymentElement } from '@stripe/react-stripe-js';
import { motion } from 'motion/react';

export function CardPayment() {
  const [ready, setReady] = useState(false);

  return (
    <div className="relative">
      {/* Skeleton while Stripe loads */}
      {!ready && (
        <div className="animate-[pulse_1.5s_ease-in-out_infinite] bg-gray-200 dark:bg-gray-700 rounded-xl h-32 w-full" />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className={ready ? '' : 'absolute inset-0'}
      >
        <PaymentElement
          onReady={() => setReady(true)}
          options={{ layout: 'tabs' }}
        />
      </motion.div>
    </div>
  );
}
