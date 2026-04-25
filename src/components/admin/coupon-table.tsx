'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { InfluencerCoupon } from '@/lib/referral/types';

type SortKey = 'code' | 'influencer_name' | 'total_uses' | 'total_revenue_cents' | 'last_used' | 'is_active';
type SortDir = 'asc' | 'desc';

interface CouponTableProps {
  coupons: InfluencerCoupon[];
  onDeactivate: (code: string) => void;
  onReactivate: (code: string) => void;
  loading?: boolean;
}

export function CouponTable({ coupons, onDeactivate, onReactivate, loading }: CouponTableProps) {
  const t = useTranslations('admin.coupons');
  const [sortBy, setSortBy] = useState<SortKey>('created_at' as SortKey);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [confirmingCode, setConfirmingCode] = useState<string | null>(null);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortBy === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(key);
        setSortDir('asc');
      }
    },
    [sortBy],
  );

  const sorted = useMemo(() => {
    const copy = [...coupons];
    copy.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let cmp = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        cmp = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
        cmp = Number(aVal) - Number(bVal);
      }

      return sortDir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [coupons, sortBy, sortDir]);

  function handleKeyDown(e: React.KeyboardEvent, code: string) {
    if (e.key === 'Escape' && confirmingCode === code) {
      setConfirmingCode(null);
    }
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: 'code', label: 'Code' },
    { key: 'influencer_name', label: 'Influencer' },
    { key: 'total_uses', label: 'Uses' },
    { key: 'total_revenue_cents', label: 'Revenue' },
    { key: 'last_used', label: 'Last Used' },
    { key: 'is_active', label: 'Status' },
  ];

  // Loading skeleton
  if (loading) {
    return (
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border" style={{ backgroundColor: '#F5F5F5' }}>
              {columns.map((col) => (
                <th key={col.key} scope="col" className="px-4 py-3 text-left text-sm font-bold">
                  {col.label}
                </th>
              ))}
              <th scope="col" className="px-4 py-3 text-left text-sm font-bold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map((i) => (
              <tr key={i} className="border-b border-border last:border-0">
                {[...columns, { key: 'actions' }].map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 rounded bg-gray-200 animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Empty state
  if (coupons.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold mb-2">{t('emptyTitle')}</h3>
        <p className="text-gray-600 mb-4">{t('emptyBody')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border" style={{ backgroundColor: '#F5F5F5' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className="px-4 py-3 text-left text-sm font-bold cursor-pointer select-none hover:bg-gray-200 transition-colors"
                onClick={() => handleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {sortBy === col.key &&
                    (sortDir === 'asc' ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    ))}
                </span>
              </th>
            ))}
            <th scope="col" className="px-4 py-3 text-left text-sm font-bold">
              Profile
            </th>
            <th scope="col" className="px-4 py-3 text-left text-sm font-bold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((coupon) => {
            const isConfirming = confirmingCode === coupon.code;

            return (
              <tr
                key={coupon.code}
                className={`border-b border-border last:border-0 transition-colors duration-200 ${
                  isConfirming ? 'bg-red-50' : 'hover:bg-gray-50'
                }`}
                onKeyDown={(e) => handleKeyDown(e, coupon.code)}
              >
                <td className="px-4 py-3 font-mono font-bold">{coupon.code}</td>
                <td className="px-4 py-3">{coupon.influencer_name}</td>
                <td className="px-4 py-3">{coupon.total_uses}</td>
                <td className="px-4 py-3">{'\u20AC'}{(coupon.total_revenue_cents / 100).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-600">
                  {coupon.last_used ? formatRelativeDate(coupon.last_used) : '--'}
                </td>
                <td className="px-4 py-3">
                  {coupon.is_active ? (
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: 'rgba(67, 160, 71, 0.1)',
                        color: '#43A047',
                      }}
                    >
                      Active
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {coupon.social_url ? (
                    <a
                      href={coupon.social_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:underline truncate max-w-[120px]"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{new URL(coupon.social_url).hostname}</span>
                    </a>
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {isConfirming ? (
                    <div className="flex gap-1">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          onDeactivate(coupon.code);
                          setConfirmingCode(null);
                        }}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setConfirmingCode(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : coupon.is_active ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirmingCode(coupon.code)}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onReactivate(coupon.code)}
                    >
                      Reactivate
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
