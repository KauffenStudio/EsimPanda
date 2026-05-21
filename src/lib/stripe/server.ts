// Server-side Stripe instance (mock-safe).
// In production, this creates a real Stripe instance.
// During development, API routes use mock data instead of calling this.

export function getStripeServer() {
  // Lazy import to avoid loading stripe package during dev if not installed.
  // The `stripe` package (v22) is CommonJS and exports the constructor as the
  // module itself — there is no `.default`. Using `.default` here returned
  // `undefined`, which threw "Stripe is not a constructor" on every checkout.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require('stripe');
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
}
