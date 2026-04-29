'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { getBestDiscount, getPlansForDestination } from '@/lib/mock-data/plans';
import { useCartStore } from '@/stores/cart';
import { useCurrencyStore } from '@/stores/currency';
import { formatPrice } from '@/lib/currency/rates';

interface DestinationCardProps {
  name: string;
  slug: string;
  isoCode: string;
  imageUrl: string;
  destinationId: string;
  startingPriceCents: number;
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
  destinationId,
  startingPriceCents,
}: DestinationCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const currency = useCurrencyStore((s) => s.currency);

  const bestDiscount = getBestDiscount(destinationId);
  const flag = isoToFlag(isoCode);

  const handleClick = () => {
    // Auto-select the most expensive (highest GB) plan
    const plans = getPlansForDestination(destinationId);
    if (plans.length > 0) {
      const sorted = [...plans].sort((a, b) => b.retail_price_cents - a.retail_price_cents);
      addItem(sorted[0]);
    }
    router.push(`/${locale}/esim/${slug}`);
  };

  return (
    <Card
      variant="elevated"
      className="cursor-pointer overflow-hidden group"
      onClick={handleClick}
    >
      <div className="aspect-[4/3] relative overflow-hidden rounded-card">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Discount badge — shows best available discount */}
        {bestDiscount > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-[#E53935] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            up to -{bestDiscount}%
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-semibold text-sm tracking-tight">
            {flag} {name}
          </p>
          <p className="text-white/70 text-xs mt-0.5">
            {t('browse.from')} {formatPrice(startingPriceCents, currency)}
          </p>
        </div>
      </div>
    </Card>
  );
}
