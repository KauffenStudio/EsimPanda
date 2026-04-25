'use client';

import { useTranslations } from 'next-intl';

interface CouponStatsCardProps {
  activeCount: number;
  totalUses: number;
  totalRevenueCents: number;
}

export function CouponStatsCard({ activeCount, totalUses, totalRevenueCents }: CouponStatsCardProps) {
  const t = useTranslations('admin.coupons');

  const stats = [
    { label: t('statsActive'), value: activeCount },
    { label: t('statsUses'), value: totalUses },
    {
      label: t('statsRevenue'),
      value: `\u20AC${(totalRevenueCents / 100).toFixed(2)}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg p-4"
          style={{ backgroundColor: '#F5F5F5' }}
        >
          <p className="text-sm text-gray-600">{stat.label}</p>
          <p className="text-2xl font-bold mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
