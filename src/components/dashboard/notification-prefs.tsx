'use client';

import { useTranslations } from 'next-intl';
import { useNotificationStore } from '@/stores/notifications';
import { Bell, BarChart3, Tag } from 'lucide-react';

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  isLast?: boolean;
}

function ToggleRow({ icon, label, checked, onChange, isLast }: ToggleRowProps) {
  return (
    <div
      className={`flex items-center justify-between h-12 ${
        isLast ? '' : 'border-b border-border dark:border-border-dark'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-600 dark:text-gray-400">{icon}</span>
        <span className="text-sm dark:text-gray-100">{label}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export function NotificationPrefs() {
  const t = useTranslations('notifications');
  const {
    expiryAlerts,
    usageAlerts,
    promotions,
    setExpiryAlerts,
    setUsageAlerts,
    setPromotions,
  } = useNotificationStore();

  return (
    <div className="bg-surface dark:bg-surface-dark rounded-card p-4 mt-6">
      <h3 className="text-lg font-semibold dark:text-gray-100 mb-4">
        {t('title')}
      </h3>

      <ToggleRow
        icon={<Bell size={20} />}
        label={t('expiry_alerts')}
        checked={expiryAlerts}
        onChange={setExpiryAlerts}
      />
      <ToggleRow
        icon={<BarChart3 size={20} />}
        label={t('usage_alerts')}
        checked={usageAlerts}
        onChange={setUsageAlerts}
      />
      <ToggleRow
        icon={<Tag size={20} />}
        label={t('promotions')}
        checked={promotions}
        onChange={setPromotions}
        isLast
      />
    </div>
  );
}
