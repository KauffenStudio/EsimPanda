import { defineConfig, devices } from '@playwright/test';

// VER-01 E2E config. This run does a REAL Stripe test-mode purchase that
// triggers a REAL Celitech eSIM provisioning and a REAL Resend email.
// Run it manually with `npm run test:e2e` — NEVER in CI / npm test.
// Requires .env.local with NEXT_PUBLIC_STRIPE_MOCK=false and live keys.

export default defineConfig({
  testDir: './e2e',
  timeout: 150_000,            // real Celitech provisioning + polling can take ~60s
  expect: { timeout: 15_000 },
  fullyParallel: false,        // one real purchase — no parallelism
  workers: 1,
  retries: 0,                  // a real purchase must not auto-retry (would double-charge)
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // Local target: build + start the app. Skipped if E2E_BASE_URL points elsewhere.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run build && npm run start',
        url: 'http://localhost:3000',
        timeout: 180_000,
        reuseExistingServer: true,
      },
});
