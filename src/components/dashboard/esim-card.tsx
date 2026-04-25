'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { CircularGauge } from './circular-gauge';
import { Button } from '@/components/ui/button';
import type { DashboardEsim } from '@/lib/dashboard/types';

interface EsimCardProps {
  esim: DashboardEsim;
  onTopUp: (esim: DashboardEsim) => void;
}

const statusBadgeStyles: Record<DashboardEsim['status'], { bg: string; text: string }> = {
  active: { bg: 'rgba(67, 160, 71, 0.15)', text: '#43A047' },
  expired: { bg: 'rgba(158, 158, 158, 0.15)', text: '#616161' },
  pending: { bg: 'rgba(251, 140, 0, 0.15)', text: '#FB8C00' },
};

const statusI18nKeys: Record<DashboardEsim['status'], string> = {
  active: 'dashboard.status_active',
  expired: 'dashboard.status_expired',
  pending: 'dashboard.status_pending',
};

function isoToFlagEmoji(iso: string): string {
  return iso
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

export function EsimCard({ esim, onTopUp }: EsimCardProps) {
  const t = useTranslations();
  const badge = statusBadgeStyles[esim.status];
  const flag = isoToFlagEmoji(esim.destination_iso);

  const expiryDate = esim.expires_at
    ? new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(esim.expires_at))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[10px] p-4 bg-surface dark:bg-surface-dark"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" role="img" aria-label={esim.destination}>
            {flag}
          </span>
          <span className="text-base font-bold dark:text-gray-100">{esim.destination}</span>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-sm font-normal"
          style={{ backgroundColor: badge.bg, color: badge.text }}
        >
          {t(statusI18nKeys[esim.status])}
        </span>
      </div>

      {/* Gauge */}
      <div className="flex justify-center mb-3">
        <CircularGauge
          total_gb={esim.data_total_gb}
          used_gb={esim.data_used_gb}
          size={96}
          status={esim.status}
          destination={esim.destination}
        />
      </div>

      {/* Info */}
      <div className="text-center mb-3 space-y-1">
        {expiryDate && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('dashboard.expires', { date: expiryDate })}
          </p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('dashboard.data_used', {
            used: esim.data_used_gb.toString(),
            total: esim.data_total_gb.toString(),
          })}
        </p>
      </div>

      {/* Reactivate note for expired */}
      {esim.status === 'expired' && (
        <p className="text-sm italic text-center mb-2 text-gray-600 dark:text-gray-400">
          {t('dashboard.top_up_reactivate_note')}
        </p>
      )}

      {/* Top Up CTA */}
      <Button
        variant="primary"
        className="w-full"
        onClick={() => onTopUp(esim)}
      >
        {t('dashboard.top_up')}
      </Button>
    </motion.div>
  );
}
