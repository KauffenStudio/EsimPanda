'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Check } from 'lucide-react';

interface ReferralLinkCardProps {
  code: string;
  onCopy: () => Promise<boolean>;
}

export function ReferralLinkCard({ code, onCopy }: ReferralLinkCardProps) {
  const t = useTranslations('referral');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await onCopy();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className="rounded-lg p-4 bg-surface dark:bg-surface-dark"
    >
      <p className="text-sm font-bold mb-2 dark:text-gray-100">Your Referral Link</p>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm truncate flex-1" style={{ color: '#2979FF' }}>
          esimpanda.com/r/{code}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-bold text-white transition-colors shrink-0"
          style={{ backgroundColor: copied ? '#43A047' : '#2979FF' }}
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span aria-live="polite">
            {copied ? t('copied') : t('copyLink')}
          </span>
        </button>
      </div>
    </div>
  );
}
