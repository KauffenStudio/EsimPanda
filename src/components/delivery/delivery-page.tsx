'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useDeliveryStore } from '@/stores/delivery';
import { useAuthStore } from '@/stores/auth';
import { detectDeviceFamily } from './device-detection';
import { ProvisioningState } from './provisioning-state';
import { EsimCredentials } from './esim-credentials';
import { SetupGuide } from './setup-guide';
import { ProvisioningError } from './provisioning-error';
import { AccountConversionCTA } from '@/components/auth/account-conversion-cta';
import { PostPurchaseShareCTA } from '@/components/referral/post-purchase-share-cta';
import { InstallBanner } from '@/components/pwa/install-banner';
import { useReferralStore } from '@/stores/referral';

interface DeliveryPageProps {
  paymentIntentId: string;
  email?: string;
}

const POLLING_INTERVAL = 2000;
const PROVISIONING_TIMEOUT = 30000;

export function DeliveryPage({ paymentIntentId, email }: DeliveryPageProps) {
  const t = useTranslations('delivery');
  const { status, data, error, retry_count, setStatus, setData, setError, setEmail } =
    useDeliveryStore();
  const authUser = useAuthStore((s) => s.user);
  const referralCode = useReferralStore((s) => s.code);
  const fetchReferralData = useReferralStore((s) => s.fetchReferralData);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(false);

  const deviceFamily = useMemo(
    () => (typeof navigator !== 'undefined' ? detectDeviceFamily(navigator.userAgent) : 'desktop'),
    []
  );

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/delivery/status?payment_intent=${paymentIntentId}`);
      if (!res.ok) return;
      const result = await res.json();

      if (result.status === 'ready' && result.data) {
        stopPolling();
        setData(result.data, result.order_id);
      } else if (result.status === 'failed') {
        stopPolling();
        setError(result.error || 'Provisioning failed', result.retry_count || 0);
      }
    } catch {
      // Silently continue polling on network errors
    }
  }, [paymentIntentId, stopPolling, setData, setError]);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    if (email) setEmail(email);
    setStatus('provisioning');

    // Trigger provisioning
    fetch('/api/delivery/provision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payment_intent_id: paymentIntentId, email }),
    }).catch(() => {
      // Provision request failed, polling will handle detection
    });

    // Start polling
    pollingRef.current = setInterval(pollStatus, POLLING_INTERVAL);

    // Timeout guard
    timeoutRef.current = setTimeout(() => {
      stopPolling();
      setError('Provisioning timed out', 0);
    }, PROVISIONING_TIMEOUT);

    return () => stopPolling();
  }, [paymentIntentId, email, setEmail, setStatus, pollStatus, stopPolling, setError]);

  // Cache QR data in service worker for offline access
  useEffect(() => {
    if (status === 'ready' && data && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        if (reg.active) {
          reg.active.postMessage({
            type: 'CACHE_QR',
            orderId: paymentIntentId,
            qrData: data.activation_qr_base64,
            setupGuide: {
              smdp_address: data.smdp_address,
              manual_activation_code: data.manual_activation_code,
            },
          });
        }
      });
    }
  }, [status, data, paymentIntentId]);

  // Fetch referral data when delivery is ready and user is logged in
  useEffect(() => {
    if (status === 'ready' && authUser) {
      fetchReferralData();
    }
  }, [status, authUser, fetchReferralData]);

  // TODO: Production — move reward trigger to provisioning webhook (after eSIM activation, not on payment alone)
  // Trigger referral reward API when ref cookie exists
  useEffect(() => {
    if (status !== 'ready') return;

    // Read ref cookie (set by /r/[code] redirect)
    const refCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('ref='))
      ?.split('=')[1];

    if (!refCookie) return;

    const buyerEmail = email || authUser?.email;
    if (!buyerEmail) return;

    // Trigger reward for the referrer (mock mode: immediate; production: would be on eSIM activation webhook)
    fetch('/api/referral/reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referrer_code: refCookie, buyer_email: buyerEmail }),
    }).then(() => {
      // Clear the ref cookie after claiming
      document.cookie = 'ref=; Max-Age=0; path=/';
    }).catch(() => {
      // Silently fail — reward will be handled on retry or manually
    });
  }, [status, email, authUser]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-[480px] flex-col items-center justify-center px-4">
      <AnimatePresence mode="wait">
        {(status === 'pending' || status === 'provisioning') && (
          <motion.div
            key="provisioning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <ProvisioningState />
          </motion.div>
        )}

        {status === 'ready' && data && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-full space-y-4 text-center"
          >
            <h1 className="text-2xl font-bold text-success dark:text-success-dark">
              {t('ready.heading')}
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-400">
              {t('ready.subheading')}
            </p>

            <EsimCredentials data={data} />

            {email && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('email.reminder', { email })}
              </p>
            )}

            <SetupGuide deviceFamily={deviceFamily} />

            {email && !authUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <AccountConversionCTA email={email} />
              </motion.div>
            )}

            {/* Referral share CTA — shown for all users on successful delivery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="w-full mt-4"
            >
              <PostPurchaseShareCTA referralCode={referralCode ?? undefined} />
            </motion.div>

            <InstallBanner />
          </motion.div>
        )}

        {status === 'failed' && (
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <ProvisioningError retryCount={retry_count} error={error ?? undefined} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
