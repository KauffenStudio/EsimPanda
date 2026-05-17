import { test, expect } from '@playwright/test';

// =============================================================================
// VER-01 — REAL end-to-end purchase verification.
// =============================================================================
// MANUAL RUN ONLY. Run with `npm run test:e2e` — NEVER in `npm test` or CI.
//
// This test drives a REAL purchase against the LIVE integration stack:
//   - REAL Stripe test-mode charge (test card 4242 4242 4242 4242 — free)
//   - the REAL Stripe webhook -> provisionEsim
//   - a REAL Celitech `createPurchaseV2` call -> a REAL low-cost eSIM is
//     provisioned (a small real cost — this eSIM is the accepted VER-01 artifact)
//   - encrypted activation data persisted in the REAL Supabase
//   - a REAL Resend delivery email sent to the test inbox
//
// PREREQUISITE: the app MUST run with `NEXT_PUBLIC_STRIPE_MOCK=false` and live
// keys (Stripe test keys, Celitech, Supabase, Resend, ESIM_ENCRYPTION_KEY).
// In mock mode the pay button short-circuits to a fake success page — the
// webhook, Celitech call, and email are all skipped, so the test would "pass"
// against nothing. See playwright.config.ts and the Phase 14 deploy runbook.
//
// COMPANION MANUAL CHECKS (not asserted here):
//   - Supabase: an `orders` row exists with an advanced `status`; the matching
//     `esims` row has an ICCID + encrypted activation columns.
//   - The Resend delivery email arrived at the test inbox below.
// =============================================================================

const TEST_EMAIL = 'e2e+ver01@esimpanda.co';

test('completes a real purchase and provisions an eSIM', async ({ page }) => {
  // ---------------------------------------------------------------------------
  // 1. Browse — land on the live catalog grid.
  // ---------------------------------------------------------------------------
  await page.goto('/en/browse');
  // browse/page.tsx renders an <h1> ("Destinations").
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  // ---------------------------------------------------------------------------
  // 2. Open the first destination. DestinationCard is a clickable <div> (a
  //    `Card` with onClick -> router.push to /en/esim/<slug>) — NOT a link/role,
  //    so we target the card by its name+price text content.
  // ---------------------------------------------------------------------------
  const firstDestination = page
    .locator('[class*="cursor-pointer"]')
    .filter({ hasText: /from/i })
    .first();
  await expect(firstDestination).toBeVisible();
  await firstDestination.click();
  await expect(page).toHaveURL(/\/en\/esim\//);

  // ---------------------------------------------------------------------------
  // 3. Pick the cheapest plan. The esim/[slug] page renders PlanCard items —
  //    each is a clickable <div> showing "<n>GB" and a price like "$4.50".
  //    Clicking a PlanCard adds it to the cart store. We read every plan's
  //    rendered price, find the lowest, and click that card. No hard-coded
  //    plan ID — a true black-box flow resilient to catalog changes.
  // ---------------------------------------------------------------------------
  await expect(page.getByRole('heading', { name: /available plans|plans/i }))
    .toBeVisible();

  const planCards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /GB/ });
  await expect(planCards.first()).toBeVisible();
  const planCount = await planCards.count();
  expect(planCount).toBeGreaterThan(0);

  let cheapestIndex = 0;
  let cheapestCents = Number.POSITIVE_INFINITY;
  for (let i = 0; i < planCount; i++) {
    const text = (await planCards.nth(i).innerText()) ?? '';
    // The accent price is the LAST currency value in the card (an original
    // strike-through price may precede it). Take the minimum match to be safe.
    const prices = [...text.matchAll(/\$\s?([\d,]+\.\d{2})/g)].map((m) =>
      Math.round(parseFloat(m[1].replace(/,/g, '')) * 100)
    );
    if (prices.length === 0) continue;
    const cardPrice = Math.min(...prices);
    if (cardPrice < cheapestCents) {
      cheapestCents = cardPrice;
      cheapestIndex = i;
    }
  }
  await planCards.nth(cheapestIndex).click();

  // ---------------------------------------------------------------------------
  // 4. Open the cart and proceed to checkout. The cart icon is a button with
  //    aria-label="Cart"; the CartDrawer's "Checkout" button pushes
  //    /en/checkout?plan=<realPlanId>.
  // ---------------------------------------------------------------------------
  await page.getByRole('button', { name: /^cart$/i }).click();
  await page.getByRole('button', { name: /^checkout$/i }).click();
  await expect(page).toHaveURL(/\/en\/checkout\?plan=/, { timeout: 30_000 });

  // ---------------------------------------------------------------------------
  // 5. Fill the email field (EmailField renders <input type="email">).
  // ---------------------------------------------------------------------------
  const emailField = page.locator('input[type="email"]');
  await expect(emailField).toBeVisible({ timeout: 30_000 });
  await emailField.fill(TEST_EMAIL);

  // ---------------------------------------------------------------------------
  // 6. Stripe <PaymentElement> renders its card inputs inside a cross-origin
  //    iframe served by js.stripe.com — Playwright must use frameLocator.
  //    The exact iframe/input selectors are version-sensitive (@stripe/stripe-js
  //    9.2.0); if this run fails to find the fields, inspect the live DOM with
  //    `npx playwright test --debug` and tighten the selector (1-2 iterations
  //    are expected and acceptable for a manual E2E).
  // ---------------------------------------------------------------------------
  const stripeFrame = page.frameLocator(
    'iframe[title*="payment" i], iframe[name^="__privateStripeFrame"]'
  );
  const cardNumber = stripeFrame.locator('[name="number"]');
  await expect(cardNumber).toBeVisible({ timeout: 30_000 }); // wait for the iframe to mount
  await cardNumber.fill('4242 4242 4242 4242');
  await stripeFrame.locator('[name="expiry"]').fill('12 / 30');
  await stripeFrame.locator('[name="cvc"]').fill('123');
  // PaymentElement may also require a postal code / country depending on the
  // Stripe account config (Stripe Tax is enabled). Fill it if present — the
  // 4242 test card accepts any valid future expiry and any postal code.
  const postalCode = stripeFrame.locator('[name="postalCode"]');
  if (await postalCode.count()) {
    await postalCode.fill('10001');
  }

  // ---------------------------------------------------------------------------
  // 7. Pay. The pay button text is "Pay $<amount>".
  // ---------------------------------------------------------------------------
  await page.getByRole('button', { name: /^pay\s*\$/i }).click();

  // ---------------------------------------------------------------------------
  // 8. Success page. Stripe redirects to /en/checkout/success?payment_intent=pi_…
  //    Provisioning is async — delivery-page.tsx triggers /api/delivery/provision
  //    then polls /api/delivery/status (~2s interval, ~60s timeout). The real
  //    Celitech round-trip can take 30-60s, so the "ready" assertion needs a
  //    generous timeout.
  // ---------------------------------------------------------------------------
  await expect(page).toHaveURL(
    /\/checkout\/success\?payment_intent=pi_/,
    { timeout: 30_000 }
  );
  await expect(
    page.getByRole('heading', { name: /your esim is ready/i })
  ).toBeVisible({ timeout: 90_000 });

  // ---------------------------------------------------------------------------
  // 9. The eSIM QR is present — qr-code-display.tsx renders a <QRCodeSVG>,
  //    i.e. an <svg> element.
  // ---------------------------------------------------------------------------
  await expect(page.locator('svg').first()).toBeVisible();
});
