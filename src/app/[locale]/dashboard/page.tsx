'use client';

import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { useDashboardStore } from '@/stores/dashboard';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs';
import { LowDataBanner } from '@/components/dashboard/low-data-banner';
import { UsageTimestamp } from '@/components/dashboard/usage-timestamp';
import { EsimGrid } from '@/components/dashboard/esim-grid';
import { TopUpModal } from '@/components/dashboard/top-up-modal';
import { NotificationPrefs } from '@/components/dashboard/notification-prefs';
import { PurchaseHistoryList } from '@/components/dashboard/purchase-history-list';
import { resendDeliveryEmail } from '@/lib/dashboard/actions';
import { toast } from 'sonner';
import Link from 'next/link';

export default function DashboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const authInitialized = useAuthStore((s) => s.initialized);
  const {
    esims,
    purchases,
    loading,
    error,
    active_tab,
    last_usage_refresh,
    usage_refreshing,
    setActiveTab,
    openTopUp,
    refreshUsage,
    initialize,
  } = useDashboardStore();

  useEffect(() => {
    useDashboardStore.getState().initialize();
  }, []);

  const handleTopUp = (esim: Parameters<typeof openTopUp>[0]) => {
    openTopUp(esim);
  };

  const handleResendEmail = async (orderId: string) => {
    const result = await resendDeliveryEmail(orderId, '');
    if (result.success) {
      toast.success(t('dashboard.resend_email_success', { email: '' }));
    } else {
      toast.error(t('dashboard.resend_email_error'));
    }
  };

  // Auth gate — require login
  if (authInitialized && !user) {
    return (
      <div className="flex flex-col items-center px-4 pt-1 pb-4 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tighter text-primary dark:text-gray-100 mb-2">
          {t('dashboard.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm text-sm mb-4">
          {t('dashboard.empty_body')}
        </p>
        <div className="flex flex-row gap-2 sm:gap-3 w-full max-w-md">
          <Link href={`/${locale}/login`} className="flex-1 min-w-0">
            <Button variant="primary" size="md" className="w-full">
              <LogIn size={16} className="mr-1.5 shrink-0" />
              <span className="truncate">{t('auth.login.submit')}</span>
            </Button>
          </Link>
          <Link href={`/${locale}/signup`} className="flex-1 min-w-0">
            <Button variant="secondary" size="md" className="w-full">
              <UserPlus size={16} className="mr-1.5 shrink-0" />
              <span className="truncate">{t('auth.signup.submit')}</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="px-4 pt-2 pb-4 max-w-5xl mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center px-4 pt-1 pb-4 max-w-5xl mx-auto">
        <h2 className="text-lg font-bold mb-2">
          {t('dashboard.error_title')}
        </h2>
        <p className="text-sm text-center mb-4" style={{ color: '#616161' }}>
          {t('dashboard.error_body')}
        </p>
        <Button variant="primary" onClick={() => initialize()}>
          {t('dashboard.error_retry')}
        </Button>
      </div>
    );
  }

  // Empty state
  if (esims.length === 0) {
    return (
      <div className="flex flex-col items-center px-4 pt-1 pb-4 max-w-5xl mx-auto">
        <h2 className="text-lg font-bold mb-2">
          {t('dashboard.empty_title')}
        </h2>
        <p className="text-sm text-center mb-4" style={{ color: '#616161' }}>
          {t('dashboard.empty_body')}
        </p>
        <Link href={`/${locale}/browse`}>
          <Button variant="primary">{t('dashboard.empty_cta')}</Button>
        </Link>
      </div>
    );
  }

  // Populated state
  return (
    <div className="px-4 pt-2 pb-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tighter text-primary dark:text-gray-100 mb-3">{t('dashboard.title')}</h1>

      {/* Low data banners */}
      <div className="mb-3">
        <LowDataBanner esims={esims} onTopUp={handleTopUp} />
      </div>

      {/* Tabs */}
      <DashboardTabs active_tab={active_tab} onTabChange={setActiveTab} />

      {/* Tab content */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          {active_tab === 'esims' ? (
            <motion.div
              key="esims"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <div className="mb-4">
                <UsageTimestamp
                  last_refresh={last_usage_refresh}
                  refreshing={usage_refreshing}
                  onRefresh={refreshUsage}
                />
              </div>
              <EsimGrid esims={esims} onTopUp={handleTopUp} />
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <PurchaseHistoryList
                purchases={purchases}
                onResendEmail={handleResendEmail}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NotificationPrefs />

      {/* Top-up modal — always mounted, visibility controlled by store */}
      <TopUpModal />
    </div>
  );
}
