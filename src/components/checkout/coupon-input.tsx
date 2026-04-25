'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'motion/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useCheckoutStore } from '@/stores/checkout';

export function CouponInput() {
  const t = useTranslations('checkout.coupon');
  const { coupon_code, plan_id, applyCoupon, removeCoupon } = useCheckoutStore();
  const [expanded, setExpanded] = useState(false);
  const [code, setCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleApply = useCallback(async () => {
    if (!code.trim()) return;
    setValidating(true);
    setError(undefined);

    try {
      const res = await fetch('/api/checkout/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), plan_id }),
      });
      const data = await res.json();

      if (!data.valid) {
        setError(data.error === 'min_order' ? t('min_order') : t('invalid'));
        setValidating(false);
        return;
      }

      // Update intent with coupon
      const intentRes = await fetch('/api/checkout/update-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id, coupon_code: code.trim() }),
      });
      const intentData = await intentRes.json();

      applyCoupon(
        code.trim(),
        intentData.discount,
        intentData.subtotal,
        intentData.tax_amount,
        intentData.amount
      );

      setExpanded(false);
    } catch {
      setError(t('invalid'));
    } finally {
      setValidating(false);
    }
  }, [code, plan_id, applyCoupon, t]);

  const handleRemove = useCallback(async () => {
    removeCoupon();

    try {
      const intentRes = await fetch('/api/checkout/update-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id }),
      });
      const intentData = await intentRes.json();

      useCheckoutStore.getState().setPricing(
        intentData.subtotal,
        intentData.tax_amount,
        intentData.amount,
        0
      );
    } catch {
      // Pricing will resync on next intent update
    }

    setCode('');
    setError(undefined);
    setExpanded(false);
  }, [plan_id, removeCoupon]);

  // Applied state
  if (coupon_code) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1 bg-success/10 text-success px-2 py-1 rounded-lg font-medium">
          {coupon_code}
        </span>
        <button
          type="button"
          onClick={handleRemove}
          className="text-gray-600 underline text-sm hover:text-destructive"
        >
          {t('remove')}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Trigger link */}
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-sm text-gray-600 underline hover:text-accent"
        >
          {t('trigger')}
        </button>
      )}

      {/* Expandable input */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 mt-2">
              <div className="flex-1">
                <Input
                  placeholder={t('placeholder')}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (error) setError(undefined);
                  }}
                  error={error}
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleApply}
                disabled={validating || !code.trim()}
              >
                {validating ? (
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  t('apply')
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
