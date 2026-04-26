'use client';

import { memo } from 'react';
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

const MemoizedDestinationCard = memo(DestinationCard);

export function DestinationGrid() {
  const t = useTranslations();
  const { destinations } = useDestinations();
  const searchQuery = useBrowseStore((state) => state.searchQuery);

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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {destinations.map((dest, index) => (
            <motion.div
              key={dest.slug}
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: 0.5,
                delay: (index % 4) * 0.08,
                ease: [0.32, 0.72, 0, 1],
              }}
            >
              <MemoizedDestinationCard
                name={dest.name}
                slug={dest.slug}
                isoCode={dest.iso_code}
                imageUrl={dest.image_url}
                startingPriceCents={getStartingPrice(dest.id)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <ComparisonBar />
      <ComparisonSheet />
    </div>
  );
}
