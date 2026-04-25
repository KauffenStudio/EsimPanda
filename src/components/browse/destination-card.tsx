'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

interface DestinationCardProps {
  name: string;
  slug: string;
  isoCode: string;
  imageUrl: string;
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
  startingPriceCents,
}: DestinationCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const price = (startingPriceCents / 100).toFixed(2);
  const flag = isoToFlag(isoCode);

  return (
    <Card
      variant="elevated"
      className="cursor-pointer overflow-hidden dark:border dark:border-border-dark"
      onClick={() => router.push(`/${locale}/esim/${slug}`)}
    >
      <div className="aspect-[4/3] relative overflow-hidden rounded-[var(--radius-card)]">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-bold text-sm">
            {flag} {name}
          </p>
          <p className="text-white/80 text-xs">
            {t('browse.from')} &euro;{price}
          </p>
        </div>
      </div>
    </Card>
  );
}
