'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { QrCodeDisplay } from '@/components/delivery/qr-code-display';
import { resendDeliveryEmail } from '@/lib/dashboard/actions';
import type { PurchaseRecord } from '@/lib/dashboard/types';

interface PurchaseHistoryRowProps {
  purchase: PurchaseRecord;
  onResendEmail: (orderId: string) => void;
}

function isoToFlag(iso: string): string {
  return iso
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

export function PurchaseHistoryRow({ purchase, onResendEmail }: PurchaseHistoryRowProps) {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [resending, setResending] = useState(false);

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(purchase.date));

  const formattedAmount = `$${(purchase.amount_paid_cents / 100).toFixed(2)}`;

  const vatRate =
    purchase.subtotal_cents - purchase.discount_cents > 0
      ? Math.round(
          (purchase.tax_cents / (purchase.subtotal_cents - purchase.discount_cents)) * 100,
        )
      : 0;

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const result = await resendDeliveryEmail(purchase.order_id, '');
      if (result.success) {
        toast.success('Delivery email sent');
      } else {
        toast.error('Failed to send email');
      }
    } catch {
      toast.error('Failed to send email');
    } finally {
      setResending(false);
    }
    onResendEmail(purchase.order_id);
  };

  return (
    <div className="bg-white dark:bg-background-dark">
      {/* Collapsed row trigger */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-surface-dark transition-colors cursor-pointer"
        style={{ minHeight: 56 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">{formattedDate}</span>
          <span className="text-base font-bold dark:text-gray-100">
            {isoToFlag(purchase.destination_iso)} {purchase.destination}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base dark:text-gray-100">{formattedAmount}</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-200 dark:border-border-dark px-4 py-3 space-y-2">
              {/* Detail rows */}
              <DetailRow label={t('dashboard.history_order_id')} value={`ORD-${purchase.order_id}`} />
              <DetailRow label={t('dashboard.history_plan')} value={purchase.plan_name} />
              <DetailRow label={t('dashboard.history_payment')} value={purchase.payment_method} />

              {purchase.coupon_code && (
                <DetailRow
                  label={t('dashboard.history_coupon', {
                    code: purchase.coupon_code,
                    discount: purchase.subtotal_cents > 0
                      ? Math.round((purchase.discount_cents / purchase.subtotal_cents) * 100)
                      : 0,
                  })}
                  value={purchase.coupon_code}
                />
              )}

              <DetailRow
                label={t('dashboard.history_subtotal')}
                value={`${purchase.currency} ${(purchase.subtotal_cents / 100).toFixed(2)}`}
              />
              <DetailRow
                label={t('dashboard.history_vat', { rate: vatRate })}
                value={`${purchase.currency} ${(purchase.tax_cents / 100).toFixed(2)}`}
              />
              <DetailRow
                label={t('dashboard.history_total')}
                value={`${purchase.currency} ${(purchase.amount_paid_cents / 100).toFixed(2)}`}
              />
              <DetailRow label={t('dashboard.history_iccid')} value={purchase.iccid} />

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className="rounded-lg border border-gray-300 dark:border-border-dark px-3 py-1.5 text-sm font-medium dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-surface-dark transition-colors"
                >
                  View QR Code
                </button>
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-surface-dark transition-colors disabled:opacity-50"
                >
                  Re-send Email
                </button>
              </div>

              {/* QR Code display */}
              <AnimatePresence>
                {showQr && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-3 overflow-hidden"
                  >
                    <QrCodeDisplay
                      data={`LPA:1$smdp.example.com$${purchase.iccid}`}
                      size={160}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
}
