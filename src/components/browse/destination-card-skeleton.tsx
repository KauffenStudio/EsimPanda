'use client';

// Shimmer skeleton for the browse grid (UXD-05). Dimensions are load-bearing:
// the placeholder card MUST match DestinationCard exactly (rounded-card +
// aspect-[4/3] + same border) so the data-swap causes zero layout shift.
// Pulse class is the exact string reused from checkout-skeleton.tsx.

const PULSE = 'animate-[pulse_1.5s_ease-in-out_infinite] bg-gray-200 dark:bg-gray-700';

/** A single placeholder card matching DestinationCard's footprint. */
export function DestinationCardSkeleton() {
  return (
    <div
      className={`rounded-card aspect-[4/3] border border-border dark:border-border-dark overflow-hidden ${PULSE}`}
    />
  );
}

/**
 * Grid of placeholder cards in the exact country-grid layout. Decorative —
 * carries aria-hidden so screen readers are not fed fake content (the route
 * transition is what announces loading). Default count 12 fills a full
 * 3-row x 4-col lg grid.
 */
export function DestinationGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      aria-hidden="true"
      data-testid="destination-grid-skeleton"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
    >
      {Array.from({ length: count }).map((_, i) => (
        <DestinationCardSkeleton key={i} />
      ))}
    </div>
  );
}
