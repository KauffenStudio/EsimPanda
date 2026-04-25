'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import type { ReferralStats as ReferralStatsType } from '@/lib/referral/types';

interface ReferralStatsProps {
  stats: ReferralStatsType;
}

const statKeys = [
  { key: 'statsInvited', field: 'friends_invited' },
  { key: 'statsEarned', field: 'free_plans_earned' },
  { key: 'statsRemaining', field: 'free_plans_remaining' },
] as const;

export function ReferralStats({ stats }: ReferralStatsProps) {
  const t = useTranslations('referral');

  return (
    <div>
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {statKeys.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3, ease: 'easeOut' }}
            className="rounded-lg p-4 text-center bg-surface dark:bg-surface-dark"
          >
            <dd className="text-2xl font-bold dark:text-gray-100">
              {stats[item.field]}
            </dd>
            <dt className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {t(item.key)}
            </dt>
          </motion.div>
        ))}
      </dl>

      {stats.free_plans_remaining === 0 && (
        <p className="text-sm mt-3" style={{ color: '#FB8C00' }}>
          {t('capReached', {
            date: new Date(stats.cap_resets_at).toLocaleDateString(),
          })}
        </p>
      )}
    </div>
  );
}
