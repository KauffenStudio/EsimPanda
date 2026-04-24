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
      <p className="text-base text-center py-8" style={{ color: '#616161' }}>
        {t('dashboard.no_purchases')}
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
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
