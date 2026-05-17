'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { useCurrencyStore } from '@/stores/currency';
import { formatPrice } from '@/lib/currency/rates';
import { TypographicFallbackCard } from './typographic-fallback-card';

interface DestinationCardProps {
  name: string;
  slug: string;
  isoCode: string;
  // null for uncurated rows / curated gaps — renders the typographic fallback.
  imageUrl: string | null;
  destinationId: string;
  startingPriceCents: number;
  bestDiscountPercent: number;
}

function isoToFlag(isoCode: string): string {
  return isoCode
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');
}

export function DestinationCard({
  name,
  slug,
  isoCode,
  imageUrl,
  startingPriceCents,
  bestDiscountPercent,
}: DestinationCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const currency = useCurrencyStore((s) => s.currency);
  const reduceMotion = useReducedMotion();

  const flag = isoToFlag(isoCode);

  // Navigation-only (RESEARCH Open Question 2 — auto-add-to-cart dropped).
  const handleClick = () => {
    router.push(`/${locale}/esim/${slug}`);
  };

  return (
    <Card
      variant="elevated"
      className="cursor-pointer overflow-hidden group"
      onClick={handleClick}
    >
      <div className="aspect-[4/3] relative overflow-hidden rounded-card">
        {/* Typographic fallback is ALWAYS the base layer — the photo cross-fades
            in OVER it so there is no flicker if the photo 404s (CAT-07). */}
        <TypographicFallbackCard name={name} />

        {imageUrl && (
          <motion.img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            initial={
              reduceMotion
                ? { opacity: 1, filter: 'blur(0px)' }
                : { opacity: 0, filter: 'blur(12px)' }
            }
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.4, ease: 'easeOut' }}
          />
        )}

        {/* Bottom scrim — keeps the name/price chip legible over photo OR gradient. */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Discount badge — shows best available discount */}
        {bestDiscountPercent > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-[#E53935] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            up to -{bestDiscountPercent}%
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-semibold text-sm tracking-tight">
            {flag} {name}
          </p>
          <p className="text-white/70 text-xs mt-0.5">
            {startingPriceCents === 0
              ? t('browse.noPlans')
              : `${t('browse.from')} ${formatPrice(startingPriceCents, currency)}`}
          </p>
        </div>
      </div>
    </Card>
  );
}
