# eSIM Panda — v1.1 Production Deploy Runbook

> **Phase 14 prepares the release; it does NOT push to production.**
> This document records the manual deploy steps. The production push is a
> human go/no-go decision — no agent auto-triggers a user-visible release.

---

## 1. Vercel environment-variable delta

Before deploying, reconcile the Vercel project environment variables.

### Remove

| Variable | Why |
|----------|-----|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Phase 13 removed WhatsApp from the code and from `.env.example`. The Vercel dashboard value is now dead — delete it from the project env (Production, Preview, Development). |

### Confirm present (all required by v1.1 code)

These must all be set in the **Production** environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CELITECH_CLIENT_ID`
- `CELITECH_CLIENT_SECRET`
- `CELITECH_WEBHOOK_SECRET`
- `CRON_SECRET`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ESIM_ENCRYPTION_KEY`
- `RESEND_API_KEY`

### Confirm correct values

- **`NEXT_PUBLIC_STRIPE_MOCK`** — MUST be `false` (or unset) in **Production**.
  A value of `true` routes real users through the mock pay button — no Stripe
  charge, no webhook, no Celitech provisioning, no email. This is a release blocker.
- **Push-notification vars** — `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`:
  confirm present if web push is live. `NEXT_PUBLIC_PUSH_MOCK` should be `false`/unset
  in Production if push is live.
- **APNs vars** (`APN_KEY_ID`, `APN_TEAM_ID`, `APN_BUNDLE_ID`, `APN_PRIVATE_KEY`):
  confirm present if the iOS app delivers native push.

---

## 2. Same-deploy requirement (service worker)

The `CACHE_NAME` bump in `public/sw.js` (`esim-panda-v1` → `esim-panda-v2`,
landed this phase) **MUST ship in the SAME deploy as the v1.1 code cutover.**

- A separate SW-only deploy, or a code deploy that omits the bump, creates a
  window where new application code is served against the **old cache** —
  returning users keep getting stale pre-cutover bundles (Pitfall 5).
- The bumped SW's `activate` handler auto-evicts the `esim-panda-v1` cache on
  next activation. `QR_CACHE_NAME` (`esim-qr-data`) is unchanged, so offline
  QR codes survive the bump.
- Do not split the SW change into its own release.

---

## 3. The manual production-push step (user-performed)

Phase 14 does **not** execute this step. It is documented here only.

The operator triggers the release manually, via one of:

```bash
# Option A — merge the release branch into main (Vercel auto-deploys main)
git checkout main && git merge <release-branch> && git push origin main

# Option B — direct production deploy from the repo root
vercel --prod
```

**This is a human go/no-go decision.** An agent does not auto-trigger a
real, user-visible release. Confirm the automated gates (below) are green
before pushing.

### Pre-push gate (must all be green)

- [ ] `npx tsc --noEmit` — clean
- [ ] `npm run build` — succeeds
- [ ] `npm test` — full unit suite green (≥273)
- [ ] `npm run lint` — clean
- [ ] `grep -q "esim-panda-v2" public/sw.js` — SW cache bump present

---

## 4. Post-deploy verification checklist (for the operator)

Run these against the **live** production site after the push:

- [ ] Open the live site — confirm fresh v1.1 content loads.
- [ ] On a **returning device** (one that has the old `esim-panda-v1` SW
      cached): confirm the **"New version available"** banner appears once.
- [ ] Tap **Reload** on the banner — confirm the page reloads once and shows
      fresh content (no reload loop).
- [ ] **Dismiss** the banner — confirm it hides and the current version keeps
      serving.
- [ ] **iOS Capacitor app (TestFlight):** verify the bumped `esim-panda-v2`
      cache takes effect. WKWebView has service-worker edge cases (carried-over
      STATE.md blocker) — confirm on a real device via TestFlight.
- [ ] Run `npm run test:e2e` (delivered by plan 14-02) against production —
      or against an accepted preview deploy — as the **VER-01** verification
      artifact. This does a real Stripe test-card purchase that provisions a
      real low-cost Celitech eSIM and sends a real Resend email.
- [ ] After the E2E: query Supabase — confirm the `orders` row status advanced
      and the `esims` row has an ICCID + encrypted activation columns.
- [ ] Confirm the delivery email arrived at the E2E test inbox (manual companion
      check — provisioning success is the automated proof).

---

*Phase: 14-e2e-verification-and-deploy · Runbook authored 2026-05-17*
