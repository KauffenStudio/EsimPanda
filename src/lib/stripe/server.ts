// Server-side Stripe instance (mock-safe).
// In production, this creates a real Stripe instance.
// During development, API routes use mock data instead of calling this.

export function getStripeServer() {
  // Lazy import to avoid loading stripe package during dev if not installed
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require('stripe').default;
  return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock');
}
