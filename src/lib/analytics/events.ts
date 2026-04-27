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

/**
 * Track an analytics event. Currently logs to console in development.
 * Replace the implementation body with your analytics provider
 * (PostHog, Mixpanel, GA4, etc.) when ready.
 */
export function trackEvent(event: AnalyticsEvent, properties?: EventProperties): void {
  if (typeof window === 'undefined') return;

  // Development logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${event}`, properties || '');
  }

  // TODO: Replace with your analytics provider
  // Example: posthog.capture(event, properties);
  // Example: mixpanel.track(event, properties);
  // Example: gtag('event', event, properties);
}
