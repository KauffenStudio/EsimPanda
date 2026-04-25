'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CopyableField } from './copyable-field';

interface ManualCodesProps {
  smdpAddress: string;
  activationCode: string;
}

export function ManualCodes({ smdpAddress, activationCode }: ManualCodesProps) {
  const t = useTranslations('delivery');
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between py-2 text-base text-gray-600 dark:text-gray-400 transition-colors duration-150 hover:text-accent"
      >
        <span>{t('manual.trigger')}</span>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="manual-codes"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 rounded-lg bg-[#F5F5F5] dark:bg-surface-dark p-4">
              <CopyableField label={t('manual.smdp')} value={smdpAddress} />
              <CopyableField label={t('manual.code')} value={activationCode} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
