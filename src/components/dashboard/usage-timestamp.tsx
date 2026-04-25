'use client';

import { useTranslations } from 'next-intl';
import { RefreshCw } from 'lucide-react';

interface UsageTimestampProps {
  last_refresh: string | null;
  refreshing: boolean;
  onRefresh: () => void;
  refresh_error?: boolean;
}

export function UsageTimestamp({
  last_refresh,
  refreshing,
  onRefresh,
  refresh_error = false,
}: UsageTimestampProps) {
  const t = useTranslations();

  let minutesAgo = 0;
  if (last_refresh) {
    minutesAgo = Math.floor(
      (Date.now() - new Date(last_refresh).getTime()) / 60000
    );
  }

  const isStale = !last_refresh || minutesAgo > 5;
  const textColor = isStale ? '#FB8C00' : '#616161';

  const timestampText = !last_refresh
    ? t('dashboard.usage_fresh')
    : minutesAgo < 1
      ? t('dashboard.usage_fresh')
      : t('dashboard.usage_stale', { minutes: minutesAgo.toString() });

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: textColor }}>
          {timestampText}
        </span>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          aria-label={t('dashboard.refresh_label')}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            style={{
              color: '#616161',
              animation: refreshing ? 'spin 600ms linear infinite' : 'none',
            }}
          />
        </button>
      </div>
      {refresh_error && (
        <span className="text-sm mt-1" style={{ color: '#FB8C00' }}>
          {t('dashboard.usage_outdated')}
        </span>
      )}
    </div>
  );
}
