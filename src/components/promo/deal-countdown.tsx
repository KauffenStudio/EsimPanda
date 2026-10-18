'use client';

import { useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';
import { useDealCountdown } from '@/lib/hooks/use-deal-countdown';

interface Props {
  className?: string;
}

/** "Ends in 2d 14:05:09" — sits beside the discount badges. */
export function DealCountdown({ className = '' }: Props) {
  const t = useTranslations('promo');
  const timeLeft = useDealCountdown();

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold text-destructive ${className}`}
      // Announcing every second would drown a screen reader; the value is
      // still readable on focus/navigation.
      aria-live="off"
    >
      <Clock size={12} className="shrink-0" aria-hidden="true" />
      <span>{t('endsIn')}</span>
      {/* Fixed-width digits so the line does not jitter as seconds change;
          min-width reserves the space before hydration fills it in. */}
      <span className="tabular-nums min-w-[9ch]">{timeLeft}</span>
    </span>
  );
}
