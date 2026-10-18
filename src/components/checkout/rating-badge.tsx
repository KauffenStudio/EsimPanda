'use client';

import { Star } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { REVIEW_SUMMARY } from '@/lib/reviews/review-summary';

/** Five stars + the rating with its source. Hidden when REVIEW_SUMMARY is null. */
export function RatingBadge() {
  const t = useTranslations('checkout.trust');
  const locale = useLocale();
  if (!REVIEW_SUMMARY) return null;

  const { rating, source, respondents } = REVIEW_SUMMARY;
  const fillPercent = Math.max(0, Math.min(100, (rating / 5) * 100));
  const ratingLabel = rating.toLocaleString(locale);

  const label =
    source === 'survey'
      ? respondents
        ? t('ratedSurveyCount', { rating: ratingLabel, count: respondents.toLocaleString(locale) })
        : t('ratedSurvey', { rating: ratingLabel })
      : t('rated', {
          rating: ratingLabel,
          count: source.reviewCount.toLocaleString(locale),
          source: source.platform,
        });

  const content = (
    <>
      {/* Grey row with a gold row clipped to the score on top — 4.8 reads as 4.8, not 5. */}
      <span className="relative inline-flex shrink-0" role="img" aria-label={`${ratingLabel}/5`}>
        <span className="flex text-gray-300 dark:text-gray-600">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={16} fill="currentColor" strokeWidth={0} aria-hidden="true" />
          ))}
        </span>
        <span
          className="absolute inset-0 flex overflow-hidden text-amber-400"
          style={{ width: `${fillPercent}%` }}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={16} fill="currentColor" strokeWidth={0} className="shrink-0" aria-hidden="true" />
          ))}
        </span>
      </span>
      <span>{label}</span>
    </>
  );

  const className = 'flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300 mb-3 pb-3 border-b border-border dark:border-border-dark';

  return source === 'survey' ? (
    <p className={className}>{content}</p>
  ) : (
    <a href={source.url} target="_blank" rel="noopener noreferrer" className={`${className} hover:underline`}>
      {content}
    </a>
  );
}
