'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DeviceFamily } from './device-detection';
import { isMobile } from './device-detection';
import { SetupSteps } from './setup-steps';
import { WHATSAPP_SUPPORT_URL } from '@/lib/config/support';

interface SetupGuideProps {
  deviceFamily: DeviceFamily;
}

const TABS: { key: string; label: string }[] = [
  { key: 'ios', label: 'iPhone' },
  { key: 'samsung', label: 'Samsung' },
  { key: 'pixel', label: 'Pixel' },
  { key: 'android-other', label: 'Other Android' },
];

export function SetupGuide({ deviceFamily }: SetupGuideProps) {
  const t = useTranslations('delivery');
  const [expanded, setExpanded] = useState(true);

  const mobile = useMemo(
    () => (typeof navigator !== 'undefined' ? isMobile(navigator.userAgent) : false),
    []
  );

  // On desktop, show tabs; on mobile, auto-select detected device
  const [selectedTab, setSelectedTab] = useState<string>(
    deviceFamily === 'desktop' ? 'ios' : deviceFamily
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between py-2 text-base text-gray-600 dark:text-gray-400 transition-colors duration-150 hover:text-accent"
      >
        <span>{t('setup.trigger')}</span>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="setup-guide"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="rounded-lg bg-[#F5F5F5] dark:bg-surface-dark p-4">
              {/* Desktop: show tabs for all device families */}
              {!mobile && (
                <div className="mb-4 flex gap-2">
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSelectedTab(tab.key)}
                      className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors duration-150 ${
                        selectedTab === tab.key
                          ? 'bg-accent text-white'
                          : 'bg-white dark:bg-background-dark text-gray-600 dark:text-gray-400 hover:text-accent'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}

              <SetupSteps deviceFamily={selectedTab} />

              <p className="mt-4 text-center">
                <a
                  href={WHATSAPP_SUPPORT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-accent underline transition-colors duration-150 hover:text-accent-hover"
                >
                  {t('setup.help')}
                </a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
