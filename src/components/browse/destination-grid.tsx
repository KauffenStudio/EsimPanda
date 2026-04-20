'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { useDestinations } from '@/hooks/use-destinations';
import { useBrowseStore } from '@/stores/browse';
import { getStartingPrice } from '@/lib/mock-data/plans';
import { DestinationSearch } from './destination-search';
import { DestinationCard } from './destination-card';
import { RegionalPlanCard } from './regional-plan-card';
import { PlanAccordion } from './plan-accordion';
import { BambuEmpty } from '@/components/bambu/bambu-empty';

const MemoizedDestinationCard = memo(DestinationCard);

export function DestinationGrid() {
  const t = useTranslations();
  const { destinations } = useDestinations();
  const expandedDestination = useBrowseStore((state) => state.expandedDestination);
  const searchQuery = useBrowseStore((state) => state.searchQuery);

  return (
    <div className="flex flex-col gap-4">
      <DestinationSearch />
      <RegionalPlanCard />

      {destinations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <BambuEmpty size={120} className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-center font-bold">
            {t('browse.noResults', { query: searchQuery })}
          </p>
          <p className="text-gray-400 text-center text-sm mt-1">
            {t('browse.noResultsSuggestion')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {destinations.map((dest) => (
            <div key={dest.slug} className="contents">
              <MemoizedDestinationCard
                name={dest.name}
                slug={dest.slug}
                isoCode={dest.iso_code}
                imageUrl={dest.image_url}
                startingPriceCents={getStartingPrice(dest.id)}
              />
              {expandedDestination === dest.slug && (
                <div className="col-span-full">
                  <PlanAccordion isOpen={true}>
                    <div className="p-4 text-center text-gray-400">
                      Plans loading...
                    </div>
                  </PlanAccordion>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
