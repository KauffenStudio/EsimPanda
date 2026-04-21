---
phase: 4
slug: esim-delivery
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-21
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 |
| **Config file** | `vitest.config.ts` (exists) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npx vitest run --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npx vitest run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | DEL-01 | unit | `npx vitest run src/lib/delivery/__tests__/provision.test.ts -t "provision"` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 1 | DEL-01 | unit | `npx vitest run src/app/api/delivery/__tests__/status.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | INF-03 | unit | `npx vitest run src/app/api/webhooks/__tests__/stripe.test.ts` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 1 | INF-03 | unit | `npx vitest run src/lib/delivery/__tests__/provision.test.ts -t "idempotent"` | ❌ W0 | ⬜ pending |
| 04-01-05 | 01 | 1 | INF-04 | unit | `npx vitest run src/lib/delivery/__tests__/encryption.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | DEL-03 | unit | `npx vitest run src/components/delivery/__tests__/device-detection.test.ts` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | DEL-03 | unit | `npx vitest run src/data/__tests__/setup-guides.test.ts` | ❌ W0 | ⬜ pending |
| 04-03-01 | 03 | 2 | DEL-02 | unit | `npx vitest run src/lib/email/__tests__/send-delivery.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/delivery/__tests__/provision.test.ts` — stubs for DEL-01, INF-03 (provisioning + idempotency)
- [ ] `src/lib/delivery/__tests__/encryption.test.ts` — stubs for INF-04 (AES-256-GCM round-trip)
- [ ] `src/app/api/webhooks/__tests__/stripe.test.ts` — stubs for INF-03 (webhook signature + routing)
- [ ] `src/app/api/delivery/__tests__/status.test.ts` — stubs for DEL-01 (polling status endpoint)
- [ ] `src/lib/email/__tests__/send-delivery.test.ts` ��� stubs for DEL-02 (email delivery)
- [ ] `src/components/delivery/__tests__/device-detection.test.ts` — stubs for DEL-03 (device family detection)
- [ ] `src/data/__tests__/setup-guides.test.ts` — stubs for DEL-03 (guide content per family)
- [ ] Framework install: `npm install resend @react-email/components qrcode @types/qrcode`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bambu preparing animation transitions to delivery content | DEL-01 | Visual animation timing | Load success page with valid payment_intent, verify Bambu animation plays, then delivery content appears |
| Branded email renders correctly across email clients | DEL-02 | Email client rendering varies | Send test email via Resend, open in Gmail, Apple Mail, Outlook |
| Direct install link opens OS eSIM setup | DEL-01 | Requires real iOS/Android device | Tap install link on iPhone (iOS 17.4+) and Android (14+), verify OS eSIM setup dialog opens |
| QR code scans correctly from email | DEL-02 | Requires camera + QR scanner | Open email on desktop, scan QR with phone camera |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
