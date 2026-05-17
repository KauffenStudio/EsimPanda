'use client';

// Inline error banner for the browse grid (UXD-06). Renders ABOVE the grid —
// page chrome (<h1>, search, region pills, WelcomeDiscountBanner) stays mounted.
// role="alert" so it is announced when it appears after a failed retry.
// The banner is destructive-tinted; the Retry action inside it uses the ACCENT
// fill — Retry is a constructive recovery action, not a destructive one.

import { useTranslations } from 'next-intl';

interface BrowseErrorBannerProps {
  onRetry: () => void;
}

export function BrowseErrorBanner({ onRetry }: BrowseErrorBannerProps) {
  const t = useTranslations();

  return (
    <div
      role="alert"
      className="rounded-card border border-destructive/30 bg-destructive/5 dark:bg-destructive/10 px-4 py-3 flex items-center justify-between gap-3"
    >
      <p className="text-sm text-destructive dark:text-destructive-dark">
        {t('browse.error.message')}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-button bg-accent text-white text-sm font-medium px-4 py-2 min-h-[40px]"
      >
        {t('browse.error.retry')}
      </button>
    </div>
  );
}
