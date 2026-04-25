'use client';

import { useTranslations } from 'next-intl';
import { PurchaseHistoryRow } from './purchase-history-row';
import type { PurchaseRecord } from '@/lib/dashboard/types';

interface PurchaseHistoryListProps {
  purchases: PurchaseRecord[];
  onResendEmail: (orderId: string) => void;
}

export function PurchaseHistoryList({ purchases, onResendEmail }: PurchaseHistoryListProps) {
  const t = useTranslations();

  if (purchases.length === 0) {
    return (
      <p className="text-base text-center py-8 text-gray-600 dark:text-gray-400">
        {t('dashboard.no_purchases')}
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-border-dark rounded-xl border border-gray-200 dark:border-border-dark overflow-hidden">
      {purchases.map((purchase) => (
        <PurchaseHistoryRow
          key={purchase.id}
          purchase={purchase}
          onResendEmail={onResendEmail}
        />
      ))}
    </div>
  );
}
