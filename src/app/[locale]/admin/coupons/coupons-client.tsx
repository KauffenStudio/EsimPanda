'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { CouponStatsCard } from '@/components/admin/coupon-stats-card';
import { CouponCreateForm } from '@/components/admin/coupon-create-form';
import { CouponTable } from '@/components/admin/coupon-table';
import type { InfluencerCoupon } from '@/lib/referral/types';

interface CouponSummary {
  active_count: number;
  total_uses: number;
  total_revenue_cents: number;
}

export function CouponsClient() {
  const t = useTranslations('admin.coupons');
  const [coupons, setCoupons] = useState<InfluencerCoupon[]>([]);
  const [summary, setSummary] = useState<CouponSummary>({
    active_count: 0,
    total_uses: 0,
    total_revenue_cents: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons);
        setSummary(data.summary);
      }
    } catch {
      // Network error — silently fail, data stays empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  async function handleDeactivate(code: string) {
    await fetch('/api/admin/coupons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, is_active: false }),
    });
    fetchCoupons();
  }

  async function handleReactivate(code: string) {
    await fetch('/api/admin/coupons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, is_active: true }),
    });
    fetchCoupons();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('title')}</h1>
        <CouponCreateForm
          onCreated={fetchCoupons}
          existingCodes={coupons.map((c) => c.code)}
        />
      </div>

      <CouponStatsCard
        activeCount={summary.active_count}
        totalUses={summary.total_uses}
        totalRevenueCents={summary.total_revenue_cents}
      />

      <CouponTable
        coupons={coupons}
        onDeactivate={handleDeactivate}
        onReactivate={handleReactivate}
        loading={loading}
      />
    </div>
  );
}
