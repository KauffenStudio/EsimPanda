'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuickCheckoutStore } from '@/stores/quick-checkout';
import { getOriginalPrice, getDiscountPercent } from '@/lib/mock-data/plans';

function formatDuration(days: number): string {
  if (days === 1) return '24h';
  if (days >= 90) return `${Math.floor(days / 30)} months`;
  return `${days} days`;
}

type Platform = 'ios' | 'android' | 'desktop';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod|macintosh/.test(ua) && 'ontouchend' in document) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

function ApplePayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M7.078 23.55c-.473-.316-.893-.703-1.244-1.15-.383-.463-.738-.95-1.064-1.454-.766-1.12-1.365-2.345-1.78-3.636-.5-1.502-.743-2.94-.743-4.347 0-1.57.34-2.94 1.002-4.09.49-.9 1.22-1.653 2.1-2.182.85-.53 1.84-.82 2.84-.84.35 0 .73.05 1.13.15.29.08.64.21 1.07.37.55.21.85.34.95.37.32.12.59.17.8.17.16 0 .39-.05.645-.13.145-.05.42-.14.81-.31.386-.14.692-.26.935-.35.37-.11.728-.21 1.05-.26.39-.06.777-.02 1.16.1.58.18 1.02.52 1.33.95-.32.2-.58.38-.79.55-.42.34-.75.7-1.01 1.1-.34.5-.52 1.06-.53 1.67-.01.64.13 1.22.42 1.76.26.45.65.86 1.13 1.15.23.17.48.31.73.42-.1.3-.21.59-.34.88-.37.87-.78 1.71-1.25 2.5-.33.56-.6.96-.81 1.2-.33.4-.68.7-1.05.88-.42.2-.87.3-1.33.3-.3 0-.63-.06-1.01-.18-.19-.06-.43-.16-.72-.29-.37-.16-.67-.28-.93-.35-.26-.07-.55-.1-.86-.1-.29 0-.58.04-.88.13-.21.06-.46.16-.75.3-.4.18-.7.32-.94.41-.3.11-.6.18-.91.2-.31.02-.65-.04-1.01-.19zM11.82 6.16c-.31-.01-.63.05-.95.19-.4.18-.72.45-.97.79-.34.48-.56 1.03-.66 1.69-.01.06-.01.13-.02.2 0 .07 0 .14.01.21.15-.02.3-.07.45-.13.36-.15.67-.36.93-.63.29-.3.5-.67.63-1.06.12-.4.18-.74.17-1.04 0-.07-.01-.14-.02-.2-.19.01-.38.03-.57.07"></path>
    </svg>
  );
}

function GooglePayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
    </svg>
  );
}

export function QuickCheckoutBar() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const selectedPlan = useQuickCheckoutStore((s) => s.selectedPlan);
  const clear = useQuickCheckoutStore((s) => s.clear);
  const [platform, setPlatform] = useState<Platform>('desktop');

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  const handleCheckout = () => {
    if (!selectedPlan) return;
    router.push(`/${locale}/checkout?plan=${selectedPlan.id}`);
  };

  return (
    <AnimatePresence>
      {selectedPlan && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-[calc(68px+env(safe-area-inset-bottom))] left-2 right-2 z-[60] md:bottom-4 md:left-auto md:right-4 md:w-[420px]"
        >
          <div className="bg-white dark:bg-surface-dark border border-border dark:border-border-dark rounded-2xl md:rounded-[var(--radius-card)] shadow-[0_4px_24px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] p-4">
            {/* Close */}
            <button
              onClick={clear}
              className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-surface dark:hover:bg-white/5 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Plan info */}
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary dark:text-gray-100">
                  {selectedPlan.data_gb}GB · {formatDuration(selectedPlan.duration_days)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {selectedPlan.data_gb > 1 && (
                    <>
                      <span className="text-xs text-gray-400 line-through">
                        ${(getOriginalPrice(selectedPlan.retail_price_cents, selectedPlan.data_gb) / 100).toFixed(2)}
                      </span>
                      <span className="text-[10px] font-bold text-white bg-[#E53935] px-1 py-0.5 rounded">
                        -{getDiscountPercent(selectedPlan.retail_price_cents, selectedPlan.data_gb)}%
                      </span>
                    </>
                  )}
                  <span className="text-lg font-bold text-accent">
                    ${(selectedPlan.retail_price_cents / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Express pay button (platform-aware) */}
            {platform === 'ios' && (
              <button
                onClick={handleCheckout}
                className="w-full h-11 bg-black text-white rounded-[var(--radius-button)] flex items-center justify-center gap-1.5 font-medium text-sm mb-2 hover:bg-black/90 transition-colors"
              >
                <ApplePayIcon className="text-white" />
                Pay
              </button>
            )}

            {platform === 'android' && (
              <button
                onClick={handleCheckout}
                className="w-full h-11 bg-white dark:bg-gray-100 text-gray-800 border border-gray-300 rounded-[var(--radius-button)] flex items-center justify-center gap-1.5 font-medium text-sm mb-2 hover:bg-gray-50 transition-colors"
              >
                <GooglePayIcon className="text-gray-800" />
                Pay
              </button>
            )}

            {/* Main checkout button */}
            <Button variant="primary" size="lg" onClick={handleCheckout} className="w-full">
              {t('checkout.title')}
              <ArrowRight size={16} className="ml-1.5" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
