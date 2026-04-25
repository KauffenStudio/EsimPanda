'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  referralUrl: string;
  shareText: string;
}

export function ShareButtons({ referralUrl, shareText }: ShareButtonsProps) {
  const t = useTranslations('referral');
  const [copied, setCopied] = useState(false);

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleNativeShare = async () => {
    try {
      await navigator.share({
        title: 'eSIM Panda',
        text: shareText,
        url: referralUrl,
      });
    } catch {
      // User cancelled or share failed — ignore
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  const encodedText = encodeURIComponent(shareText + ' ' + referralUrl);

  // Mobile with Web Share API: single share button (covers Instagram via native share sheet)
  if (canShare) {
    return (
      <div>
        <p className="text-sm font-bold mb-2">{t('shareVia')}</p>
        <button
          type="button"
          onClick={handleNativeShare}
          className="flex items-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-bold hover:bg-gray-50 transition-colors"
          aria-label="Share referral link"
        >
          <Share2 className="h-4 w-4" />
          Share
        </button>
      </div>
    );
  }

  // Desktop fallback: individual buttons
  return (
    <div>
      <p className="text-sm font-bold mb-2">{t('shareVia')}</p>
      <div className="flex gap-3">
        {/* Copy */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex flex-col items-center gap-1 rounded-md border border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors min-w-[80px]"
          aria-label="Copy referral link"
        >
          {copied ? (
            <Check className="h-5 w-5" style={{ color: '#43A047' }} />
          ) : (
            <Copy className="h-5 w-5" />
          )}
          <span className="text-sm font-bold">{t('shareCopy')}</span>
        </button>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/?text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 rounded-md border border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors min-w-[80px]"
          aria-label="Share via WhatsApp"
        >
          <MessageCircle className="h-5 w-5" style={{ color: '#25D366' }} />
          <span className="text-sm font-bold">{t('shareWhatsapp')}</span>
        </a>

        {/* Twitter/X */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 rounded-md border border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors min-w-[80px]"
          aria-label="Share via Twitter"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="text-sm font-bold">{t('shareTwitter')}</span>
        </a>
      </div>
    </div>
  );
}
