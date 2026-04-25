'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { useReferralStore } from '@/stores/referral';
import { ReferralLinkCard } from '@/components/referral/referral-link-card';
import { ReferralStats } from '@/components/referral/referral-stats';
import { ShareButtons } from '@/components/referral/share-buttons';
import { Button } from '@/components/ui/button';

export default function ReferralPage() {
  const t = useTranslations('referral');
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);
  const { code, stats, loading, fetchReferralData, copyLink } = useReferralStore();

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user, fetchReferralData]);

  // Auth loading
  if (authLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-64 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="h-20 bg-gray-200 rounded-lg" />
            <div className="h-20 bg-gray-200 rounded-lg" />
            <div className="h-20 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Not logged in — show empty state
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 text-center">
        <h1 className="text-xl font-bold mb-2">{t('noAccountCta')}</h1>
        <p className="text-base text-gray-600 mb-6">{t('noAccount')}</p>
        <Link href={`/${locale}/login`}>
          <Button variant="primary">Log In</Button>
        </Link>
      </div>
    );
  }

  // Loading referral data
  if (loading || !code) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-64 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="h-20 bg-gray-200 rounded-lg" />
            <div className="h-20 bg-gray-200 rounded-lg" />
            <div className="h-20 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://esimpanda.com';
  const referralUrl = `${origin}/r/${code}`;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-1">{t('title')}</h1>
      <p className="text-base text-gray-600 mb-6">{t('subtitle')}</p>

      <div className="space-y-6">
        <ReferralLinkCard code={code} onCopy={copyLink} />

        <ShareButtons
          referralUrl={referralUrl}
          shareText={t('shareText', { url: referralUrl })}
        />

        {stats && <ReferralStats stats={stats} />}
      </div>
    </div>
  );
}
