'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, Mail, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { DeliveryData } from '@/lib/delivery/types';
import type { DeviceFamily } from './device-detection';
import { EsimCredentials } from './esim-credentials';
import { SetupGuide } from './setup-guide';
import { AccountConversionCTA } from '@/components/auth/account-conversion-cta';
import { PostPurchaseShareCTA } from '@/components/referral/post-purchase-share-cta';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events';

interface DeliveryStepsProps {
  data: DeliveryData;
  email?: string | null;
  deviceFamily: DeviceFamily;
  isGuest: boolean;
  referralCode?: string;
  orderId?: string | null;
}

interface StepHeaderProps {
  stepNumber: number;
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

function StepHeader({ stepNumber, title, isActive, isCompleted, onClick }: StepHeaderProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 py-3 text-left transition-colors"
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${
          isCompleted
            ? 'bg-success text-white dark:bg-success-dark'
            : isActive
              ? 'bg-accent text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}
      >
        {isCompleted ? <Check size={16} /> : stepNumber}
      </div>
      <span
        className={`flex-1 text-base font-semibold transition-colors ${
          isActive || isCompleted
            ? 'text-gray-900 dark:text-gray-100'
            : 'text-gray-400 dark:text-gray-500'
        }`}
      >
        {title}
      </span>
      <motion.div
        animate={{ rotate: isActive ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <ChevronDown
          size={20}
          className={isActive ? 'text-accent' : 'text-gray-400 dark:text-gray-600'}
        />
      </motion.div>
    </button>
  );
}

export function DeliverySteps({
  data,
  email,
  deviceFamily,
  isGuest,
  referralCode,
  orderId,
}: DeliveryStepsProps) {
  const t = useTranslations('delivery');
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [emailSending, setEmailSending] = useState(false);

  const markComplete = useCallback(
    (step: number) => {
      setCompletedSteps((prev) => new Set(prev).add(step));
      setActiveStep(step + 1);
    },
    [],
  );

  const toggleStep = useCallback((step: number) => {
    setActiveStep((prev) => (prev === step ? 0 : step));
  }, []);

  const handleEmailCredentials = useCallback(async () => {
    if (!email) return;
    trackEvent(ANALYTICS_EVENTS.DELIVERY_EMAIL_CREDENTIALS, { email });
    setEmailSending(true);
    try {
      const res = await fetch('/api/delivery/email-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          order_id: orderId,
          smdp_address: data.smdp_address,
          activation_code: data.manual_activation_code,
        }),
      });
      if (res.ok) {
        toast.success(t('email_sent', { email }));
      } else {
        toast.error(t('email_failed'));
      }
    } catch {
      toast.error(t('email_failed'));
    } finally {
      setEmailSending(false);
    }
  }, [email, orderId, data, t]);

  return (
    <div className="w-full space-y-2">
      {/* Step 1: Install your eSIM */}
      <div className="rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-border-dark overflow-hidden">
        <StepHeader
          stepNumber={1}
          title={t('steps.install')}
          isActive={activeStep === 1}
          isCompleted={completedSteps.has(1)}
          onClick={() => toggleStep(1)}
        />
        <AnimatePresence initial={false}>
          {activeStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                <EsimCredentials data={data} />

                {email && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {t('email.reminder', { email })}
                  </p>
                )}

                {/* Email me my details */}
                {email && (
                  <button
                    type="button"
                    onClick={handleEmailCredentials}
                    disabled={emailSending}
                    className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-200 dark:border-border-dark py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-background-dark transition-colors disabled:opacity-50"
                  >
                    {emailSending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Mail size={16} />
                    )}
                    {t('email_me_details')}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => markComplete(1)}
                  className="w-full rounded-lg bg-accent px-4 py-3 text-white font-semibold hover:bg-accent-hover transition-colors"
                >
                  {t('steps.next')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step 2: Set up your eSIM */}
      <div className="rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-border-dark overflow-hidden">
        <StepHeader
          stepNumber={2}
          title={t('steps.setup')}
          isActive={activeStep === 2}
          isCompleted={completedSteps.has(2)}
          onClick={() => toggleStep(2)}
        />
        <AnimatePresence initial={false}>
          {activeStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <SetupGuide deviceFamily={deviceFamily} />

                <button
                  type="button"
                  onClick={() => markComplete(2)}
                  className="w-full rounded-lg bg-accent px-4 py-3 text-white font-semibold hover:bg-accent-hover transition-colors mt-4"
                >
                  {t('steps.next')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step 3: You're all set */}
      <div className="rounded-xl bg-white dark:bg-surface-dark border border-gray-100 dark:border-border-dark overflow-hidden">
        <StepHeader
          stepNumber={3}
          title={t('steps.done')}
          isActive={activeStep === 3}
          isCompleted={completedSteps.has(3)}
          onClick={() => toggleStep(3)}
        />
        <AnimatePresence initial={false}>
          {activeStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                <p className="text-center text-base text-gray-600 dark:text-gray-400">
                  {t('steps.done_body')}
                </p>

                {email && isGuest && (
                  <AccountConversionCTA email={email} />
                )}

                <PostPurchaseShareCTA referralCode={referralCode} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
