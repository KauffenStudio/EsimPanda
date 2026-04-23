'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useDeliveryStore } from '@/stores/delivery';
import { detectDeviceFamily } from './device-detection';
import { ProvisioningState } from './provisioning-state';
import { EsimCredentials } from './esim-credentials';
import { SetupGuide } from './setup-guide';
import { ProvisioningError } from './provisioning-error';

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
            <h1 className="text-2xl font-bold text-success">
              {t('ready.heading')}
            </h1>
            <p className="text-base text-gray-600">
              {t('ready.subheading')}
            </p>

            <EsimCredentials data={data} />

            {email && (
              <p className="text-sm text-gray-600">
                {t('email.reminder', { email })}
              </p>
            )}

            <SetupGuide deviceFamily={deviceFamily} />
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
