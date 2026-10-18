// src/lib/reviews/review-summary.ts — the customer rating shown at checkout.

export interface ReviewSummary {
  /** Average score out of 5. */
  rating: number;
  /** Where the score comes from. 'survey' = the team's own customer survey. */
  source: 'survey' | { platform: string; url: string; reviewCount: number };
  /** Survey respondents, when known — shown as "by N customers". */
  respondents?: number;
}

/**
 * The claim always names its source. 4.8/5 comes from the team's customer
 * survey (Oct 2026), so it is labelled as a survey — not as a review platform
 * that does not list the business, and with no customer count beyond the real
 * number of respondents. An aggregate rating dressed up as something it is not
 * is a fabricated review under EU consumer law (UCPD Annex I 23b–c /
 * DL 57/2008). Set to null to hide the rating.
 */
export const REVIEW_SUMMARY: ReviewSummary | null = {
  rating: 4.8,
  source: 'survey',
};
