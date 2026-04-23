---
phase: 04-esim-delivery
plan: 01
subsystem: api
tags: [aes-256-gcm, encryption, provisioning, stripe-webhook, idempotent, mock-mode]

requires:
  - phase: 03-checkout-and-payments
    provides: "Stripe payment intents, order model, mock mode pattern"
provides:
  - "Idempotent eSIM provisioning pipeline (provisionEsim function)"
  - "AES-256-GCM encryption/decryption for activation data"
  - "POST /api/delivery/provision endpoint"
  - "GET /api/delivery/status endpoint"
  - "POST /api/webhooks/stripe webhook handler"
  - "DB migration for esim columns on orders table"
  - "Mock provisioning with 3-5s simulated delay"
affects: [04-02-success-page-ui, 04-03-email-delivery]

tech-stack:
  added: [resend, "@react-email/components", qrcode, "@types/qrcode"]
  patterns: [in-memory-provisioning-state, idempotent-provisioning, mock-mode-bypass]

key-files:
  created:
    - src/lib/delivery/types.ts
    - src/lib/delivery/schemas.ts
    - src/lib/delivery/encryption.ts
    - src/lib/delivery/provision.ts
    - src/lib/mock-data/delivery.ts
    - src/app/api/delivery/provision/route.ts
    - src/app/api/delivery/status/route.ts
    - src/app/api/webhooks/stripe/route.ts
    - supabase/migrations/00002_orders_esim_columns.sql
  modified:
    - .env.example
    - package.json

key-decisions:
  - "In-memory Map for provisioning state (no Supabase in dev); will migrate to DB reads in production"
  - "SMDP address extracted from activation code format LPA:1$smdp$code"
  - "Test key fallback for encryption in NODE_ENV=test to avoid requiring env vars in CI"

patterns-established:
  - "Idempotent provisioning: check Map before calling provider, return cached result on duplicate calls"
  - "Mock mode detection: process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true' bypasses Stripe verification and uses mock data"
  - "Encryption format: iv_hex:authTag_hex:ciphertext_hex (AES-256-GCM with random IV)"

requirements-completed: [DEL-01, INF-03, INF-04]

duration: 5min
completed: 2026-04-23
---

# Phase 04 Plan 01: Delivery Data Layer Summary

**Idempotent eSIM provisioning pipeline with AES-256-GCM encryption, 3 API routes, Stripe webhook handler, and mock mode**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-23T14:52:26Z
- **Completed:** 2026-04-23T14:57:23Z
- **Tasks:** 2
- **Files modified:** 17

## Accomplishments
- Delivery types (EsimStatus, ProvisioningStatus, DeliveryData, ProvisionResult) and Zod validation schemas
- AES-256-GCM encrypt/decrypt utilities with random IV and GCM authentication
- Idempotent provisioning function with retry logic (3 attempts, 2s delay) and mock mode support
- 3 API routes: provision (POST), status (GET), webhook (POST with signature verification)
- Mock provisioning with 3-5 second simulated delay returning realistic activation data
- DB migration adding 5 esim columns to orders table with indexes
- 15 unit tests all passing (encryption, provisioning, status, webhook)

## Task Commits

Each task was committed atomically:

1. **Task 1: Delivery types, encryption, mock data, DB migration** - `f5e8a00` (feat)
2. **Task 2: Provisioning logic, API routes, webhook handler** - `a86bdd8` (feat)

## Files Created/Modified
- `src/lib/delivery/types.ts` - EsimStatus, ProvisioningStatus, DeliveryData, ProvisionResult types
- `src/lib/delivery/schemas.ts` - Zod schemas for provision request, status request, webhook event
- `src/lib/delivery/encryption.ts` - AES-256-GCM encrypt/decrypt with ESIM_ENCRYPTION_KEY
- `src/lib/delivery/provision.ts` - Core idempotent provisionEsim function with retry and mock mode
- `src/lib/mock-data/delivery.ts` - Mock provisioning with simulated 3-5s delay
- `src/app/api/delivery/provision/route.ts` - POST endpoint triggering provisioning
- `src/app/api/delivery/status/route.ts` - GET endpoint polling provisioning state
- `src/app/api/webhooks/stripe/route.ts` - Stripe webhook handler for payment_intent.succeeded
- `supabase/migrations/00002_orders_esim_columns.sql` - Adds esim_iccid, esim_qr_encrypted, esim_status, esim_activation_code_encrypted, esim_smdp_address_encrypted
- `.env.example` - Added STRIPE_WEBHOOK_SECRET, ESIM_ENCRYPTION_KEY, RESEND_API_KEY, NEXT_PUBLIC_STRIPE_MOCK

## Decisions Made
- In-memory Map for provisioning state since no Supabase connection in dev; production will use DB reads
- SMDP address extracted from activation code LPA format rather than stored separately
- Test key fallback in encryption module avoids requiring env vars in CI/test environments

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Zod v4 z.record() signature**
- **Found during:** Task 1 (schemas)
- **Issue:** Zod v4 requires `z.record(keySchema, valueSchema)` instead of `z.record(z.unknown())`
- **Fix:** Changed to `z.record(z.string(), z.unknown())`
- **Files modified:** src/lib/delivery/schemas.ts
- **Verification:** tsc --noEmit passes clean
- **Committed in:** a86bdd8

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor API change for Zod v4 compatibility. No scope creep.

## Issues Encountered
- Pre-existing build failure in `src/components/checkout/pay-button.tsx` (React hooks rules-of-hooks lint error from Phase 03). Out of scope, logged but not fixed.

## User Setup Required

Environment variables needed before production deployment:
- `STRIPE_WEBHOOK_SECRET` - From Stripe Dashboard -> Developers -> Webhooks -> Signing secret
- `ESIM_ENCRYPTION_KEY` - 32-byte hex string for AES-256-GCM encryption
- `RESEND_API_KEY` - From Resend dashboard (for Plan 03 email delivery)

Stripe Dashboard: Add webhook endpoint URL pointing to `/api/webhooks/stripe` with event `payment_intent.succeeded`.

## Next Phase Readiness
- Provisioning pipeline ready for success page UI (Plan 02) to consume via `/api/delivery/provision` and `/api/delivery/status`
- Email delivery (Plan 03) can use encrypted activation data from provisioning results
- All mock mode paths tested and working

---
*Phase: 04-esim-delivery*
*Completed: 2026-04-23*
