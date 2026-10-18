'use client';

import { RatingSummary } from '@/components/reviews/rating-summary';

/** Rating line at the top of the checkout trust box. */
export function RatingBadge() {
  return (
    <RatingSummary className="gap-3 text-sm text-gray-600 dark:text-gray-300 mb-3 pb-3 border-b border-border dark:border-border-dark" />
  );
}
