'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCurrencyStore } from '@/stores/currency';
import { formatPrice } from '@/lib/currency/rates';
import { getOriginalPrice, getDiscountPercent } from '@/lib/plans/pricing-display';
import { useVatRate } from '@/lib/geo/use-vat-rate';

interface PlanCardProps {
  id: string;
  data_gb: number;
  duration_days: number;
  retail_price_cents: number;
  isBestValue: boolean;
  isMostPopular: boolean;
}

function formatDuration(days: number): string {
  if (days === 1) return '24h';
  if (days >= 90) return `${Math.floor(days / 30)} months`;
  return `${days} days`;
}

export function PlanCard({
  id,
  data_gb,
  duration_days,
  retail_price_cents,
  isBestValue,
  isMostPopular,
}: PlanCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const currency = useCurrencyStore((state) => state.currency);

  // The card used to show the pre-tax price while checkout added VAT at the
  // final step — a $9.99 plan billing $12.29. Unexpected cost at checkout is
  // the most cited reason people abandon a purchase, so the card now shows
  // what the pay button will show.
  const vatRate = useVatRate();

  // Price actually charged, so the card and the pay button agree.
  const withVat = (cents: number) => Math.round(cents * (1 + vatRate / 100));
  const displayPriceCents = withVat(retail_price_cents);

  // The struck-through price has to sit on the same tax basis as the live one.
  // Showing a pre-VAT original beside a VAT-inclusive price made a 20% saving
  // render as "was $9.99, now $9.83" — the discount badge and the two numbers
  // openly contradicting each other on the page where the buyer decides.
  const originalPriceCents = withVat(getOriginalPrice(retail_price_cents, data_gb));

  const planLabel = `${data_gb}GB · ${formatDuration(duration_days)}`;

  // Straight to checkout. The cart used to sit here, and it only ever handed
  // `items[0]` to a checkout route that accepts a single plan — so a returning
  // visitor with a stale persisted item was charged for the wrong plan. A
  // sub-$20 instantly-delivered item nobody bundles does not need a basket.
  const handleCardClick = () => {
    router.push(`/${locale}/checkout?plan=${id}`);
  };

  return (
    <Card
      variant="flat"
      onClick={handleCardClick}
      aria-label={`${t('cart.buyNow')} — ${planLabel}`}
      className="relative p-4 cursor-pointer transition-colors hover:border-accent/40 dark:hover:border-accent/40"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{data_gb}GB</span>
            <span className="text-gray-400">&middot;</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {formatDuration(duration_days)}
            </span>
          </div>
          <div className="flex gap-1.5">
            {isBestValue && (
              <Badge variant="success">{t('browse.bestValue')}</Badge>
            )}
            {isMostPopular && (
              <Badge variant="accent">{t('browse.mostPopular')}</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end">
          {data_gb > 1 && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(originalPriceCents, currency)}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {data_gb > 1 && (
              <span className="text-[10px] font-bold text-white bg-destructive px-1.5 py-0.5 rounded">
                -{getDiscountPercent(retail_price_cents, data_gb)}%
              </span>
            )}
            <span className="text-xl font-bold text-accent">
              {formatPrice(displayPriceCents, currency)}
            </span>
          </div>
          {vatRate > 0 && (
            <span className="text-[10px] text-gray-400 mt-0.5">
              {t('browse.vatIncluded')}
            </span>
          )}
        </div>
      </div>

      {/* Explicit purchase affordance — the whole card is the button, but the
          action has to be visible for the card to read as buyable. */}
      <div
        aria-hidden="true"
        className="mt-3 pt-3 border-t border-border dark:border-border-dark flex items-center justify-center gap-1.5 text-sm font-semibold text-accent"
      >
        {t('cart.buyNow')}
        <ArrowRight size={16} className="shrink-0" />
      </div>
    </Card>
  );
}
