'use client';

import { motion } from 'motion/react';
import type { TopUpPackage } from '@/lib/dashboard/types';

interface TopUpPlanCardProps {
  package: TopUpPackage;
  selected: boolean;
  onSelect: (pkg: TopUpPackage) => void;
}

export function TopUpPlanCard({ package: pkg, selected, onSelect }: TopUpPlanCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(pkg)}
      className={`w-full rounded-lg p-4 text-left cursor-pointer transition-colors duration-150 ${
        selected
          ? 'border-2 border-[#2979FF] bg-[#E3F0FF]'
          : 'border border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <p className="text-base font-bold text-gray-900">{pkg.name}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-sm text-gray-600">{pkg.data_gb} GB</span>
        <span className="text-sm text-gray-400">|</span>
        <span className="text-sm text-gray-600">{pkg.duration_days} days</span>
      </div>
      <p className="mt-2 text-base font-bold text-[#2979FF]">
        EUR {(pkg.price_cents / 100).toFixed(2)}
      </p>
    </motion.button>
  );
}
