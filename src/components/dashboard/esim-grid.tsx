'use client';

import { motion } from 'motion/react';
import { EsimCard } from './esim-card';
import type { DashboardEsim } from '@/lib/dashboard/types';

interface EsimGridProps {
  esims: DashboardEsim[];
  onTopUp: (esim: DashboardEsim) => void;
}

const statusOrder: Record<DashboardEsim['status'], number> = {
  active: 0,
  pending: 1,
  expired: 2,
};

function sortEsims(esims: DashboardEsim[]): DashboardEsim[] {
  return [...esims].sort((a, b) => {
    // Primary sort: status order
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;

    // Secondary sort by expiry
    if (a.status === 'active') {
      // Active: soonest expiring first (ascending)
      const aExp = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
      const bExp = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
      return aExp - bExp;
    }

    if (a.status === 'expired') {
      // Expired: most recently expired first (descending)
      const aExp = a.expires_at ? new Date(a.expires_at).getTime() : 0;
      const bExp = b.expires_at ? new Date(b.expires_at).getTime() : 0;
      return bExp - aExp;
    }

    return 0;
  });
}

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export function EsimGrid({ esims, onTopUp }: EsimGridProps) {
  const sorted = sortEsims(esims);

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 dark:text-gray-100"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {sorted.map((esim) => (
        <EsimCard key={esim.id} esim={esim} onTopUp={onTopUp} />
      ))}
    </motion.div>
  );
}
