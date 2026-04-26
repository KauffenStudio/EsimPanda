'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { useDashboardStore } from '@/stores/dashboard';
import { BambuVideo } from '@/components/bambu/bambu-video';
import { Button } from '@/components/ui/button';
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

  // Loading state
  if (loading) {
    return (
      <div className="px-4 py-8 max-w-5xl mx-auto">
        <DashboardSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center px-4 py-8 max-w-5xl mx-auto">
        <BambuVideo variant="error" size={100} className="mb-4" />
        <h2 className="text-lg font-bold mb-2">
          {t('dashboard.error_title')}
        </h2>
        <p className="text-sm text-center mb-6" style={{ color: '#616161' }}>
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
      <div className="flex flex-col items-center px-4 py-8 max-w-5xl mx-auto">
        <BambuVideo variant="empty" size={100} className="mb-4" />
        <h2 className="text-lg font-bold mb-2">
          {t('dashboard.empty_title')}
        </h2>
        <p className="text-sm mb-6" style={{ color: '#616161' }}>
          {t('dashboard.empty_body')}
        </p>
        <Link href="/browse">
          <Button variant="primary">{t('dashboard.empty_cta')}</Button>
        </Link>
      </div>
    );
  }

  // Populated state
  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tighter text-primary dark:text-gray-100 mb-6">{t('dashboard.title')}</h1>

      {/* Low data banners */}
      <div className="mb-4">
        <LowDataBanner esims={esims} onTopUp={handleTopUp} />
      </div>

      {/* Tabs */}
      <DashboardTabs active_tab={active_tab} onTabChange={setActiveTab} />

      {/* Tab content */}
      <div className="mt-6">
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
