'use client';

import { memo, useMemo } from 'react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useDestinations } from '@/hooks/use-destinations';
import { useBrowseStore } from '@/stores/browse';
import { getStartingPrice } from '@/lib/mock-data/plans';
import { DestinationSearch } from './destination-search';
import { DestinationCard } from './destination-card';
import { RegionalPlanCard } from './regional-plan-card';
import { ComparisonBar } from './comparison-bar';
import { ComparisonSheet } from './comparison-sheet';
import { BambuVideo } from '@/components/bambu/bambu-video';
import type { MockDestination } from '@/lib/mock-data/destinations';

const MemoizedDestinationCard = memo(DestinationCard);

const regionLabels: Record<string, string> = {
  europe: 'Europe',
  asia: 'Asia',
  'north-america': 'North America',
  'south-america': 'South America',
  'middle-east': 'Middle East',
  oceania: 'Oceania',
  africa: 'Africa',
};

function groupByRegion(destinations: MockDestination[]) {
  const groups: { region: string; label: string; items: MockDestination[] }[] = [];
  const regionOrder = ['europe', 'asia', 'north-america', 'south-america', 'middle-east', 'oceania', 'africa'];

  for (const region of regionOrder) {
    const items = destinations.filter((d) => d.region === region);
    if (items.length > 0) {
      groups.push({ region, label: regionLabels[region] || region, items });
    }
  }
  return groups;
}

export function DestinationGrid() {
  const t = useTranslations();
  const { destinations } = useDestinations();
  const searchQuery = useBrowseStore((state) => state.searchQuery);

  const groups = useMemo(() => groupByRegion(destinations), [destinations]);

  return (
    <div className="flex flex-col gap-6">
      <DestinationSearch />
      <RegionalPlanCard />

      {destinations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <BambuVideo variant="empty" size={120} className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-center font-semibold">
            {t('browse.noResults', { query: searchQuery })}
          </p>
          <p className="text-gray-400 text-center text-sm mt-1">
            {t('browse.noResultsSuggestion')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((group) => (
            <section key={group.region}>
              <h2 className="text-lg font-semibold text-primary dark:text-gray-100 mb-3 tracking-tight">
                {group.label}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {group.items.map((dest, index) => (
                  <motion.div
                    key={dest.slug}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '0px' }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(index, 3) * 0.05,
                      ease: 'easeOut',
                    }}
                  >
                    <MemoizedDestinationCard
                      name={dest.name}
                      slug={dest.slug}
                      isoCode={dest.iso_code}
                      imageUrl={dest.image_url}
                      destinationId={dest.id}
                      startingPriceCents={getStartingPrice(dest.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <ComparisonBar />
      <ComparisonSheet />
    </div>
  );
}
