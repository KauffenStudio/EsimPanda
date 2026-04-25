'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { ShareButtons } from '@/components/referral/share-buttons';
import { Button } from '@/components/ui/button';

interface PostPurchaseShareCTAProps {
  referralCode?: string;
}

export function PostPurchaseShareCTA({ referralCode }: PostPurchaseShareCTAProps) {
  const t = useTranslations('referral');
  const locale = useLocale();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://esimpanda.com';
  const referralUrl = referralCode ? `${origin}/r/${referralCode}` : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="relative rounded-lg p-4"
      style={{ backgroundColor: '#F5F5F5' }}
    >
      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded hover:bg-gray-200 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4 text-gray-500" />
      </button>

      {referralCode ? (
        /* Logged in: show share CTA with referral link */
        <div>
          <h3 className="text-base font-bold mb-1 pr-6">{t('postPurchaseTitle')}</h3>
          <p className="text-sm text-gray-600 mb-3">{t('postPurchaseSubtitle')}</p>
          <ShareButtons
            referralUrl={referralUrl}
            shareText={t('shareText', { url: referralUrl })}
          />
        </div>
      ) : (
        /* Not logged in: show signup CTA */
        <div className="text-center pr-6">
          <p className="text-sm text-gray-600 mb-3">
            Create an account to start referring friends
          </p>
          <Link href={`/${locale}/signup`}>
            <Button variant="primary" size="sm">
              Create Account
            </Button>
          </Link>
        </div>
      )}
    </motion.div>
  );
}
