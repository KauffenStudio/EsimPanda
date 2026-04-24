'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import type { DashboardEsim } from '@/lib/dashboard/types';

interface LowDataBannerProps {
  esims: DashboardEsim[];
  onTopUp: (esim: DashboardEsim) => void;
}

export function LowDataBanner({ esims, onTopUp }: LowDataBannerProps) {
  const t = useTranslations();

  const lowDataEsims = esims.filter(
    (e) => e.status === 'active' && e.data_remaining_pct <= 20
  );

  if (lowDataEsims.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {lowDataEsims.map((esim) => {
        const isCritical = esim.data_remaining_pct < 10;
        const borderColor = isCritical ? '#E53935' : '#FB8C00';
        const bgColor = isCritical
          ? 'rgba(229, 57, 53, 0.1)'
          : 'rgba(251, 140, 0, 0.1)';
        const messageKey = isCritical
          ? 'dashboard.low_data_critical'
          : 'dashboard.low_data_warning';

        return (
          <motion.div
            key={esim.id}
            role="alert"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="p-3 rounded-r-md flex items-center justify-between"
            style={{
              backgroundColor: bgColor,
              borderLeft: `4px solid ${borderColor}`,
            }}
          >
            <span className="text-sm" style={{ color: '#1A1A1A' }}>
              {t(messageKey, {
                destination: esim.destination,
                percent: Math.round(esim.data_remaining_pct).toString(),
              })}
            </span>
            <button
              onClick={() => onTopUp(esim)}
              className="text-sm font-semibold ml-3 shrink-0"
              style={{ color: '#2979FF' }}
            >
              {t('dashboard.top_up')}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
