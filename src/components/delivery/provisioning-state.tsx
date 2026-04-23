'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { BambuPreparing } from '@/components/bambu/bambu-preparing';

const MESSAGE_KEYS = [
  'provisioning.message1',
  'provisioning.message2',
  'provisioning.message3',
] as const;

export function ProvisioningState() {
  const t = useTranslations('delivery');
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGE_KEYS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center px-4" style={{ maxWidth: 480 }}>
      <BambuPreparing size={160} />

      <div className="mt-4 h-8 relative w-full">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 text-center text-base text-gray-600"
          >
            {t(MESSAGE_KEYS[messageIndex])}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
