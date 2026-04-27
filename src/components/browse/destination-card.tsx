'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { getBestDiscount } from '@/lib/mock-data/plans';

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

  const price = (startingPriceCents / 100).toFixed(2);
  const bestDiscount = getBestDiscount(destinationId);
  const flag = isoToFlag(isoCode);

  return (
    <Card
      variant="elevated"
      className="cursor-pointer overflow-hidden group"
      onClick={() => router.push(`/${locale}/esim/${slug}`)}
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
            {t('browse.from')} ${price}
          </p>
        </div>
      </div>
    </Card>
  );
}
