import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getCatalog } from '@/lib/db/destinations';
import { buildBrowseMeta } from '@/lib/seo/meta-templates';
import { BrowseClient } from '@/components/browse/browse-client';
import { CurrencySwitcher } from '@/components/layout/currency-switcher';
import { WelcomeDiscountBanner } from '@/components/marketing/welcome-discount-banner';

export const revalidate = 3600; // ISR — 1 hour; matches esim/[slug]/page.tsx

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ notice?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return buildBrowseMeta(locale);
}

export default async function BrowsePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const { notice } = await searchParams;
  const { destinations, regionalPlans, error } = await getCatalog();

  return (
    <div className="px-4 pt-6 pb-20 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-primary dark:text-gray-100">
          {t('browse.title')}
        </h1>
        {/* CurrencySwitcher is a client component — valid as a child of this RSC. */}
        <div className="flex items-center gap-1 md:hidden">
          <CurrencySwitcher />
        </div>
      </div>
      <WelcomeDiscountBanner showCta={false} />
      <BrowseClient
        destinations={destinations}
        regionalPlans={regionalPlans}
        error={error}
        notice={notice}
      />
    </div>
  );
}
