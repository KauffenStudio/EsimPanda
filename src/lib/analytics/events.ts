type EventProperties = Record<string, string | number | boolean | undefined>;

// Analytics event names for all key conversion points
export const ANALYTICS_EVENTS = {
  // Checkout flow
  CHECKOUT_PAGE_VIEW: 'checkout_page_view',
  CHECKOUT_EMAIL_ENTERED: 'checkout_email_entered',
  CHECKOUT_DEVICE_CHECK: 'checkout_device_check',
  CHECKOUT_COUPON_APPLIED: 'checkout_coupon_applied',
  CHECKOUT_COUPON_FAILED: 'checkout_coupon_failed',
  CHECKOUT_PAYMENT_INITIATED: 'checkout_payment_initiated',
  CHECKOUT_PAYMENT_SUCCEEDED: 'checkout_payment_succeeded',
  CHECKOUT_PAYMENT_FAILED: 'checkout_payment_failed',

  // Delivery flow
  DELIVERY_PAGE_VIEW: 'delivery_page_view',
  DELIVERY_PROVISIONING_START: 'delivery_provisioning_start',
  DELIVERY_PROVISIONING_DELAYED: 'delivery_provisioning_delayed',
  DELIVERY_READY: 'delivery_ready',
  DELIVERY_FAILED: 'delivery_failed',
  DELIVERY_QR_VIEWED: 'delivery_qr_viewed',
  DELIVERY_INSTALL_CLICKED: 'delivery_install_clicked',
  DELIVERY_EMAIL_CREDENTIALS: 'delivery_email_credentials',
  DELIVERY_QR_DOWNLOADED: 'delivery_qr_downloaded',

  // Setup guide
  SETUP_GUIDE_OPENED: 'setup_guide_opened',
  SETUP_GUIDE_STEP_COMPLETED: 'setup_guide_step_completed',
  SETUP_GUIDE_ALL_COMPLETE: 'setup_guide_all_complete',
  SETUP_GUIDE_HELP_CLICKED: 'setup_guide_help_clicked',

  // Top-up flow
  TOPUP_MODAL_OPENED: 'topup_modal_opened',
  TOPUP_PLAN_SELECTED: 'topup_plan_selected',
  TOPUP_PAYMENT_INITIATED: 'topup_payment_initiated',
  TOPUP_PAYMENT_SUCCEEDED: 'topup_payment_succeeded',
  TOPUP_PAYMENT_FAILED: 'topup_payment_failed',

  // Referral
  REFERRAL_SHARE_CLICKED: 'referral_share_clicked',
  REFERRAL_LINK_COPIED: 'referral_link_copied',

  // Account
  ACCOUNT_CONVERSION_SHOWN: 'account_conversion_shown',
  ACCOUNT_CONVERSION_COMPLETED: 'account_conversion_completed',
} as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Push an event into gtag/dataLayer.
 *
 * `gtag` is only defined once the Google tag script has loaded, which is
 * `afterInteractive` — early events (a checkout page view fired on mount) can
 * beat it. Pushing straight onto `dataLayer` instead of calling `window.gtag`
 * means those events queue and replay when the tag initialises rather than
 * being dropped on the floor.
 */
function push(...args: unknown[]): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

/**
 * Track an analytics event. Sends to GA4 / Google Ads via gtag.
 *
 * This was a no-op stub for the whole of the first ad campaign: every call
 * site below was already wired up, but nothing left the browser, so Google Ads
 * optimised against zero signal and the funnel was invisible.
 */
export function trackEvent(event: AnalyticsEvent, properties?: EventProperties): void {
  if (typeof window === 'undefined') return;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${event}`, properties || '');
  }

  push('event', event, properties ?? {});
}

/**
 * Fire the purchase conversion.
 *
 * Sends two events on purpose:
 *  - GA4 `purchase`, the standard ecommerce event, for reporting and for
 *    Google Ads accounts that import GA4 conversions.
 *  - a Google Ads `conversion` hit with send_to = "<ads-id>/<label>", which is
 *    what smart bidding actually optimises against.
 *
 * `transaction_id` is the Stripe payment intent id so Google de-duplicates if
 * the buyer refreshes the success page — without it a reload counts as a
 * second sale and skews bidding.
 */
export function trackPurchase(input: {
  transactionId: string;
  valueCents: number;
  currency: string;
  planId?: string;
  planName?: string;
  destination?: string;
}): void {
  if (typeof window === 'undefined') return;

  const value = Number((input.valueCents / 100).toFixed(2));

  push('event', 'purchase', {
    transaction_id: input.transactionId,
    value,
    currency: input.currency,
    items: [
      {
        item_id: input.planId,
        item_name: input.planName,
        item_category: input.destination,
        price: value,
        quantity: 1,
      },
    ],
  });

  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
  if (adsId && label) {
    push('event', 'conversion', {
      send_to: `${adsId}/${label}`,
      transaction_id: input.transactionId,
      value,
      currency: input.currency,
    });
  }
}

/**
 * Grant or deny consent after the visitor answers the banner. Consent Mode
 * defaults to denied in the EEA/UK (see google-tag.tsx), so without this call
 * no conversion from the campaign's core market is ever observed.
 */
export function updateConsent(granted: boolean): void {
  const state = granted ? 'granted' : 'denied';
  push('consent', 'update', {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
}
