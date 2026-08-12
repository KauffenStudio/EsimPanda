'use client';

import { useEffect, useState, useRef } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { getStripe, STRIPE_MOCK_MODE } from '@/lib/stripe/client';
import { stripeAppearance } from '@/lib/stripe/config';
import { useCheckoutStore } from '@/stores/checkout';
import type { Plan } from '@/lib/db/destinations';

import { OrderSummary } from './order-summary';
import { EmailField } from './email-field';
import { DeviceCheck } from './device-check';
import { CouponInput } from './coupon-input';
import { ExpressCheckout } from './express-checkout';
import { PaymentDivider } from './payment-divider';
import { CardPayment } from './card-payment';
import { PayButton } from './pay-button';
import { CheckoutSkeleton } from './checkout-skeleton';
import { PaymentProcessing } from './payment-processing';
import { PaymentError } from './payment-error';
import { TrustSignals } from './trust-signals';
import { StickyOrderBar } from './sticky-order-bar';
import { CheckoutProgress } from './checkout-progress';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events';

interface CheckoutPageProps {
  plan: Plan;
  couponFromUrl?: string;
}

/** Matches the gate the pay button uses, so both agree on "usable address". */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_SYNC_DEBOUNCE_MS = 600;

export function CheckoutPage({ plan, couponFromUrl }: CheckoutPageProps) {
  const {
    client_secret,
    email,
    payment_status,
    error_message,
    setClientSecret,
    setPricing,
    setPlan,
    setPaymentStatus,
    applyCoupon,
  } = useCheckoutStore();

  const [loading, setLoading] = useState(true);
  const orderSummaryRef = useRef<HTMLDivElement>(null);

  // Persist the buyer's address server-side as soon as it is valid, rather
  // than relying on it surviving the post-payment redirect. The webhook
  // usually provisions before the browser reaches the success page, so
  // without this the order row is still blank at provisioning time: no
  // delivery email is sent and the success page cannot authorize itself to
  // show the QR. Debounced so typing doesn't fire a request per keystroke.
  useEffect(() => {
    if (!client_secret || !EMAIL_REGEX.test(email)) return;

    const timer = setTimeout(() => {
      fetch('/api/checkout/attach-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_secret, email }),
        keepalive: true,
      }).catch(() => {
        // Best-effort: provisioning also recovers the address from Stripe.
      });
    }, EMAIL_SYNC_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [client_secret, email]);

  // Initialize checkout on mount
  useEffect(() => {
    trackEvent(ANALYTICS_EVENTS.CHECKOUT_PAGE_VIEW, { plan_id: plan.id, plan_name: plan.name });
    setPlan(plan.id);

    async function initCheckout() {
      setPaymentStatus('creating');

      try {
        const res = await fetch('/api/checkout/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan_id: plan.id, email: '' }),
        });
        const data = await res.json();

        setClientSecret(data.client_secret);
        setPricing(data.subtotal, data.tax_amount, data.amount, data.discount);
        setPaymentStatus('idle');

        // Only an explicit coupon from the URL is applied. There is no
        // automatic discount: WELCOME10 used to self-apply for first-time
        // buyers, which quietly discounted every new customer's first order.
        const couponToApply = couponFromUrl;
        if (couponToApply) {
          try {
            const couponRes = await fetch('/api/checkout/validate-coupon', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: couponToApply }),
            });
            const couponData = await couponRes.json();

            if (couponData.valid) {
              const updateRes = await fetch('/api/checkout/update-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan_id: plan.id, coupon_code: couponToApply }),
              });
              const updateData = await updateRes.json();

              applyCoupon(
                couponToApply,
                updateData.discount,
                updateData.subtotal,
                updateData.tax_amount,
                updateData.amount
              );
            }
          } catch {
            // Silently fail coupon auto-apply
          }
        }
      } catch {
        setPaymentStatus('failed', 'network');
      } finally {
        setLoading(false);
      }
    }

    initCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan.id]);

  if (loading || !client_secret) {
    return <CheckoutSkeleton />;
  }

  const summaryColumn = (
    <div className="md:sticky md:top-4">
      <div ref={orderSummaryRef}>
        <OrderSummary plan={plan} />
      </div>
      <TrustSignals />
    </div>
  );

  const formColumn = (
    <div className="flex flex-col gap-4">
      <DeviceCheck />
      <EmailField />
      <CouponInput />
      {STRIPE_MOCK_MODE ? (
        <div className="rounded-lg border border-border dark:border-border-dark p-4 bg-surface dark:bg-surface-dark text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Payment methods</p>
          <p className="text-xs text-gray-400 dark:text-gray-600">Stripe Elements will render here with real API keys</p>
          <div className="mt-3 flex gap-2 justify-center">
            <div className="h-8 w-16 rounded bg-gray-100 dark:bg-background-dark border border-gray-200 dark:border-border-dark flex items-center justify-center text-xs text-gray-400 dark:text-gray-600">Apple</div>
            <div className="h-8 w-16 rounded bg-gray-100 dark:bg-background-dark border border-gray-200 dark:border-border-dark flex items-center justify-center text-xs text-gray-400 dark:text-gray-600">Google</div>
            <div className="h-8 w-16 rounded bg-gray-100 dark:bg-background-dark border border-gray-200 dark:border-border-dark flex items-center justify-center text-xs text-gray-400 dark:text-gray-600">PayPal</div>
          </div>
        </div>
      ) : (
        <>
          <ExpressCheckout />
          <PaymentDivider />
          <CardPayment />
        </>
      )}
      <PayButton />
    </div>
  );

  const checkoutContent = (
    <>
      <StickyOrderBar plan={plan} observeRef={orderSummaryRef} />
      <CheckoutProgress activeIndex={0} />

      {/* Single column on mobile, two columns on desktop */}
      <div className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_1.2fr] md:gap-8 md:items-start">
        {summaryColumn}
        {formColumn}
      </div>

      {/* Payment status overlays */}
      {payment_status === 'processing' && <PaymentProcessing />}
      {payment_status === 'failed' && (
        <PaymentError
          errorType={(error_message as 'declined' | 'network' | 'generic') || 'generic'}
          onRetry={() => setPaymentStatus('idle')}
        />
      )}
    </>
  );

  if (STRIPE_MOCK_MODE) {
    return (
      <div className="w-full max-w-[480px] md:max-w-[860px] mx-auto px-4 pb-24 md:pb-8">
        {checkoutContent}
      </div>
    );
  }

  const stripePromise = getStripe();

  return (
    <div className="w-full max-w-[480px] md:max-w-[860px] mx-auto px-4 pb-24 md:pb-8">
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret: client_secret,
          appearance: stripeAppearance,
        }}
      >
        {checkoutContent}
      </Elements>
    </div>
  );
}
