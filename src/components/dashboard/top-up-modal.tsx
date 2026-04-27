'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Elements } from '@stripe/react-stripe-js';

import { useDashboardStore } from '@/stores/dashboard';
import { getStripe, STRIPE_MOCK_MODE } from '@/lib/stripe/client';
import { mockTopUpPackages } from '@/lib/mock-data/dashboard';
import { TopUpPlanCard } from './top-up-plan-card';
import { CardPayment } from '@/components/checkout/card-payment';
import { ExpressCheckout } from '@/components/checkout/express-checkout';
import { BambuVideo } from '@/components/bambu/bambu-video';
import type { TopUpPackage, DashboardEsim } from '@/lib/dashboard/types';

function isoToFlag(iso: string): string {
  return iso
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('');
}

export function TopUpModal() {
  const esim = useDashboardStore((s) => s.top_up_esim);
  const status = useDashboardStore((s) => s.top_up_status);
  const closeTopUp = useDashboardStore((s) => s.closeTopUp);
  const setTopUpStatus = useDashboardStore((s) => s.setTopUpStatus);
  const setEsims = useDashboardStore((s) => s.setEsims);
  const esims = useDashboardStore((s) => s.esims);

  const t = useTranslations();

  const [selectedPackage, setSelectedPackage] = useState<TopUpPackage | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Escape key handler
  useEffect(() => {
    if (!esim) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTopUp();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [esim, closeTopUp]);

  // Auto-close on success
  useEffect(() => {
    if (status !== 'success') return;
    const timer = setTimeout(() => {
      closeTopUp();
    }, 2000);
    return () => clearTimeout(timer);
  }, [status, closeTopUp]);

  // Reset selection when modal opens
  useEffect(() => {
    if (status === 'plan-select') {
      setSelectedPackage(null);
      setClientSecret(null);
      setErrorMessage('');
    }
  }, [status]);

  const handleSelectPlan = useCallback(
    async (pkg: TopUpPackage) => {
      setSelectedPackage(pkg);
      setTopUpStatus('payment');

      if (STRIPE_MOCK_MODE || process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true') {
        // In mock mode, skip creating payment intent
        return;
      }

      try {
        const res = await fetch('/api/dashboard/top-up/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            iccid: esim?.iccid,
            package_id: pkg.id,
            email: '',
          }),
        });
        const data = await res.json();
        if (data.client_secret) {
          setClientSecret(data.client_secret);
        } else {
          setErrorMessage(data.error || 'Failed to create payment intent');
          setTopUpStatus('error');
        }
      } catch {
        setErrorMessage('Network error');
        setTopUpStatus('error');
      }
    },
    [esim, setTopUpStatus],
  );

  const handleMockPayment = useCallback(() => {
    setTopUpStatus('processing');
    setTimeout(() => {
      // Optimistically update eSIM data
      if (esim && selectedPackage) {
        const updated = esims.map((e: DashboardEsim) => {
          if (e.id !== esim.id) return e;
          const newTotal = e.data_total_gb + selectedPackage.data_gb;
          const newRemaining = e.data_remaining_gb + selectedPackage.data_gb;
          return {
            ...e,
            data_total_gb: newTotal,
            data_remaining_gb: newRemaining,
            data_remaining_pct: Math.round((newRemaining / newTotal) * 100),
            status: e.status === 'expired' ? ('active' as const) : e.status,
          };
        });
        setEsims(updated);
      }
      toast.success(
        t('dashboard.top_up_success_toast', { destination: esim?.destination || '' }),
      );
      setTopUpStatus('success');
    }, 1500);
  }, [esim, esims, selectedPackage, setEsims, setTopUpStatus, t]);

  const handleTryAgain = useCallback(() => {
    setTopUpStatus('plan-select');
    setErrorMessage('');
  }, [setTopUpStatus]);

  if (!esim) return null;

  return (
    <AnimatePresence>
      {esim && (
        <>
          {/* Overlay */}
          <motion.div
            key="topup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-overlay-dark z-50"
            onClick={closeTopUp}
          />

          {/* Modal */}
          <motion.div
            key="topup-modal"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white dark:bg-surface-dark rounded-2xl max-w-[480px] w-full max-h-[90vh] overflow-y-auto p-6 pointer-events-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold dark:text-gray-100">
                  {isoToFlag(esim.destination_iso)}{' '}
                  {t('dashboard.top_up_title', { destination: esim.destination })}
                </h2>
                <button
                  type="button"
                  onClick={closeTopUp}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-background-dark dark:text-gray-100 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Reactivation note for expired eSIMs */}
              {esim.status === 'expired' && (
                <p className="text-sm italic text-gray-600 dark:text-gray-400 mb-4">
                  {t('dashboard.top_up_reactivate_note')}
                </p>
              )}

              {/* Plan Select State */}
              {status === 'plan-select' && (
                <div className="space-y-3">
                  {mockTopUpPackages.map((pkg) => (
                    <TopUpPlanCard
                      key={pkg.id}
                      package={pkg}
                      selected={selectedPackage?.id === pkg.id}
                      onSelect={handleSelectPlan}
                    />
                  ))}
                </div>
              )}

              {/* Payment State */}
              {status === 'payment' && (
                <div className="space-y-4">
                  {STRIPE_MOCK_MODE || process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true' ? (
                    <div className="space-y-4">
                      <div className="rounded-lg border border-dashed border-gray-300 dark:border-border-dark p-4 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Mock Mode - Stripe Elements disabled</p>
                        <button
                          type="button"
                          onClick={handleMockPayment}
                          className="w-full rounded-lg bg-[#2979FF] px-4 py-3 text-white font-bold hover:bg-[#2164d9] transition-colors"
                        >
                          Simulate Payment - ${' '}
                          {selectedPackage ? (selectedPackage.price_cents / 100).toFixed(2) : '0.00'}
                        </button>
                      </div>
                    </div>
                  ) : clientSecret ? (
                    <Elements stripe={getStripe()} options={{ clientSecret }}>
                      <ExpressCheckout />
                      <CardPayment />
                      <button
                        type="button"
                        className="w-full rounded-lg bg-[#2979FF] px-4 py-3 text-white font-bold hover:bg-[#2164d9] transition-colors mt-4"
                      >
                        {t('dashboard.top_up_pay', {
                          amount: selectedPackage
                            ? (selectedPackage.price_cents / 100).toFixed(2)
                            : '0.00',
                        })}
                      </button>
                    </Elements>
                  ) : (
                    <div className="flex justify-center py-8">
                      <BambuVideo variant="loading" size={80} />
                    </div>
                  )}
                </div>
              )}

              {/* Processing State */}
              {status === 'processing' && (
                <div className="flex flex-col items-center py-8 gap-4">
                  <BambuVideo variant="loading" size={80} />
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    {t('dashboard.top_up_processing')}
                  </p>
                </div>
              )}

              {/* Success State */}
              {status === 'success' && (
                <div className="flex flex-col items-center py-8 gap-4">
                  <BambuVideo variant="success" size={80} />
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {t('dashboard.data_added')}
                  </p>
                </div>
              )}

              {/* Error State */}
              {status === 'error' && (
                <div className="flex flex-col items-center py-8 gap-4">
                  <BambuVideo variant="error" size={80} />
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    {errorMessage || t('dashboard.top_up_error')}
                  </p>
                  <button
                    type="button"
                    onClick={handleTryAgain}
                    className="rounded-lg border border-gray-300 dark:border-border-dark px-4 py-2 text-sm font-medium dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-background-dark transition-colors"
                  >
                    {t('dashboard.top_up_try_again')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
