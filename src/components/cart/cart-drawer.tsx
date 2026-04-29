'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, ShoppingCart, ArrowRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart';
import { useCurrencyStore } from '@/stores/currency';
import { formatPrice } from '@/lib/currency/rates';
import { CartItemRow } from './cart-item';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function CartDrawer() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const clear = useCartStore((s) => s.clear);
  const coupon_code = useCartStore((s) => s.coupon_code);
  const discount_percent = useCartStore((s) => s.discount_percent);
  const setCoupon = useCartStore((s) => s.setCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  const currency = useCurrencyStore((s) => s.currency);

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | undefined>(undefined);
  const [validating, setValidating] = useState(false);

  const subtotalCents = items.reduce((sum, i) => sum + i.plan.retail_price_cents, 0);
  const discountCents = coupon_code ? Math.round(subtotalCents * discount_percent / 100) : 0;
  const totalCents = subtotalCents - discountCents;

  const handleApplyPromo = useCallback(async () => {
    if (!promoInput.trim()) return;
    setValidating(true);
    setPromoError(undefined);

    try {
      const res = await fetch('/api/checkout/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoInput.trim() }),
      });
      const data = await res.json();

      if (!data.valid) {
        setPromoError(t('promo_invalid'));
        setValidating(false);
        return;
      }

      setCoupon(promoInput.trim(), data.discount_percent);
      setPromoInput('');
    } catch {
      setPromoError(t('promo_invalid'));
    } finally {
      setValidating(false);
    }
  }, [promoInput, setCoupon, t]);

  const handleRemovePromo = useCallback(() => {
    removeCoupon();
    setPromoInput('');
    setPromoError(undefined);
  }, [removeCoupon]);

  const handleCheckout = () => {
    if (items.length === 0) return;
    const firstPlan = items[0].plan;
    const couponParam = coupon_code ? `&coupon=${coupon_code}` : '';
    closeCart();
    router.push(`/${locale}/checkout?plan=${firstPlan.id}${couponParam}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[70]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 z-[80] w-full max-w-[400px] bg-white dark:bg-surface-dark shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-border-dark">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-accent" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {t('title')}
                </h2>
                {items.length > 0 && (
                  <span className="bg-accent/10 text-accent text-xs font-bold px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <ShoppingCart size={48} className="text-gray-200 dark:text-gray-700 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {t('empty')}
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {items.map((item) => (
                    <CartItemRow key={item.plan.id} plan={item.plan} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer: promo code + totals + checkout */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 dark:border-border-dark px-4 py-4 space-y-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
                {/* Promo code */}
                {coupon_code ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1 bg-success/10 dark:bg-success-dark/10 text-success dark:text-success-dark px-2 py-1 rounded-lg font-medium">
                      {coupon_code} (-{discount_percent}%)
                    </span>
                    <button
                      onClick={handleRemovePromo}
                      className="text-gray-600 dark:text-gray-400 underline text-xs hover:text-destructive"
                    >
                      {t('promo_remove')}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder={t('promo_placeholder')}
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value);
                          if (promoError) setPromoError(undefined);
                        }}
                        error={promoError}
                        className="text-sm"
                      />
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleApplyPromo}
                      disabled={validating || !promoInput.trim()}
                    >
                      {validating ? (
                        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        t('promo_apply')
                      )}
                    </Button>
                  </div>
                )}

                {/* Totals */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{t('subtotal')}</span>
                    <span>{formatPrice(subtotalCents, currency)}</span>
                  </div>
                  {discountCents > 0 && (
                    <div className="flex justify-between text-sm text-success dark:text-success-dark">
                      <span>{t('discount')}</span>
                      <span>-{formatPrice(discountCents, currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-gray-900 dark:text-gray-100 pt-1.5 border-t border-gray-100 dark:border-border-dark">
                    <span>{t('total')}</span>
                    <span>{formatPrice(totalCents, currency)}</span>
                  </div>
                </div>

                {/* Checkout button */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCheckout}
                  className="w-full"
                >
                  {t('checkout')}
                  <ArrowRight size={16} className="ml-1.5" />
                </Button>

                {/* Clear cart */}
                <button
                  onClick={clear}
                  className="w-full text-center text-xs text-gray-400 hover:text-destructive transition-colors"
                >
                  {t('clear')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
