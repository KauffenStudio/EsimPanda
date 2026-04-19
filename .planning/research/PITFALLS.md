# Domain Pitfalls

**Domain:** eSIM reseller platform (student/traveler-focused, Europe)
**Researched:** 2026-04-19
**Confidence:** MEDIUM (based on domain expertise; web verification unavailable during research)

---

## Critical Pitfalls

Mistakes that cause rewrites, legal exposure, or business failure.

---

### Pitfall 1: Wholesale Provider Lock-In with No Abstraction Layer

**What goes wrong:** You build your entire platform tightly coupled to one wholesale provider's API (e.g., CELITECH). Six months in, their pricing increases 20%, their coverage in Portugal drops, or their API has a 4-hour outage during peak student arrival season (September). You cannot switch without rewriting your order flow, inventory sync, and QR delivery pipeline.

**Why it happens:** Wholesale APIs differ significantly in how they handle plan catalogs, order placement, QR code delivery (some return base64, some return URLs, some send via webhook), status callbacks, and top-up flows. Teams build directly against one API's quirks.

**Consequences:** You are hostage to one provider's pricing, uptime, and coverage decisions. If they sunset a plan type or change their API version, you scramble.

**Prevention:**
- Build a **Provider Abstraction Layer** from day one with a normalized interface: `listPlans()`, `purchaseEsim()`, `getQrCode()`, `topUp()`, `getUsage()`, `getStatus()`
- Store provider-agnostic plan data in your database; sync from provider catalogs on a schedule
- Map provider-specific fields to your internal schema (your `plan_id` maps to their `package_id` or `bundle_code`)
- Design for multi-provider from the start, even if you launch with one. The abstraction costs ~2 days; rebuilding later costs weeks

**Detection:** If your codebase has provider-specific field names (e.g., `celitech_package_id`) in UI components or business logic, you are locked in.

**Phase:** Must be addressed in Phase 1 (core platform build). Retrofitting is painful.

---

### Pitfall 2: QR Code Delivery Failures as Silent Revenue Killers

**What goes wrong:** Customer pays, but the QR code never arrives, arrives corrupted, or arrives but cannot be scanned. The customer is standing in an airport in a new country with no internet. They dispute the charge. You lose the sale AND pay a chargeback fee.

**Why it happens:** Multiple failure modes:
1. **Async provisioning delays** — wholesale provider takes 5-60 seconds to provision; your UI shows "complete" before the QR is ready
2. **Email delivery failures** — QR sent via email lands in spam, or student's university email blocks it
3. **QR encoding issues** — the activation string contains special characters that break certain QR renderers
4. **One-time scan QR codes** — some providers issue QR codes that can only be scanned once; if the scan fails or the user screenshots and tries again, it is dead
5. **Webhook delivery failures** — provider sends QR via webhook, your server misses it (deploy, crash, timeout)

**Consequences:** This is your #1 customer experience moment. Failure here means chargebacks, negative reviews, and WhatsApp support floods. A student with no data in a foreign country is panicking.

**Prevention:**
- **Never rely solely on email for QR delivery.** Display the QR code directly in the web app on a persistent, accessible page (e.g., `/my-esims/[order-id]`)
- **Poll for QR readiness** after purchase — show a clear loading state ("Your eSIM is being prepared...") with a progress indicator, not a fake "success"
- **Store QR data server-side** so users can re-access it anytime from their account. Never make QR delivery one-shot
- **Implement webhook + polling fallback** — if webhook does not arrive within 30 seconds, poll the provider API
- **Add QR code validation** — after receiving QR data, verify it encodes a valid LPA activation string (format: `LPA:1$[SM-DP+]$[matching-id]`)
- **Offer "Send to WhatsApp" as backup delivery** — your target audience (students) lives on WhatsApp

**Detection:** Monitor the time between payment confirmation and QR code availability. If P95 exceeds 60 seconds, you have a problem. Track "QR re-access" rates — high rates mean first delivery is failing.

**Phase:** Core to Phase 1. The purchase-to-QR flow is the product.

---

### Pitfall 3: Chargeback Hemorrhaging on Digital Goods

**What goes wrong:** Chargebacks on digital goods (eSIM plans) run 2-4x higher than physical goods. Friendly fraud ("I never got it"), buyer's remorse ("I didn't use it"), and stolen card fraud all hit hard. At scale, chargeback rates above 0.75% trigger Stripe/payment processor monitoring programs. Above 1%, you risk account termination.

**Why it happens:**
1. **No physical proof of delivery** — Visa/Mastercard rules heavily favor cardholders for digital goods
2. **International customers** — higher fraud rates on cross-border transactions, which is 100% of your transactions
3. **Student demographic** — shared cards (parents' cards), less financial sophistication, higher "I changed my mind" rate
4. **Instant delivery** — fraudsters prefer digital goods because they get value immediately before the card is reported stolen

**Consequences:** Each chargeback costs $15-25 in fees on top of the lost sale. High chargeback rates lead to: (a) payment processor account termination, (b) being placed on MATCH/TMF list (industry blacklist), (c) needing high-risk merchant accounts with 5-10% reserves.

**Prevention:**
- **Stripe Radar** with custom rules: flag transactions where billing country differs from eSIM destination country by more than one region, flag first-time buyers purchasing highest-tier plans, require 3D Secure (SCA) for all transactions (EU PSD2 requires this anyway)
- **Collect compelling evidence** for dispute responses: IP address at time of purchase, device fingerprint, timestamp of QR code access/download, eSIM activation confirmation from provider (if available), screenshot delivery confirmation
- **Clear descriptor** — your Stripe statement descriptor must clearly say your brand name + "eSIM" so cardholders recognize the charge
- **Pre-purchase confirmation** — explicit "I understand this is a digital product delivered instantly and is non-refundable once activated" checkbox
- **Proactive refund policy** — offer easy refunds for un-activated eSIMs. It is cheaper to refund ($0 fee) than to lose a chargeback ($15-25 fee + lost revenue + chargeback ratio impact)
- **Apple Pay / Google Pay preference** — these have built-in device authentication, dramatically reducing fraud compared to manual card entry

**Detection:** Track chargeback rate weekly. Set alerts at 0.5%. If you hit 0.65%, immediately investigate patterns and tighten fraud rules.

**Phase:** Payment integration phase. Must be designed correctly from the first transaction.

---

### Pitfall 4: Ignoring EU Telecom Regulatory Requirements

**What goes wrong:** You launch an eSIM reseller in Europe without understanding whether you need to register as a telecom provider, comply with EECC (European Electronic Communications Code), or follow national telecoms authority rules. A regulatory body sends a cease-and-desist or fine.

**Why it happens:** The regulatory status of eSIM resellers is genuinely ambiguous and varies by country. Pure resellers who do not own network infrastructure may or may not fall under telecom regulation depending on:
- Whether you are classified as a "provider of electronic communications services"
- Whether you handle number assignment (you do not, for data-only)
- Whether the wholesale provider already holds the necessary licenses
- National interpretation of EU directives

**Consequences:** Fines (can be significant under EU telecom law), forced shutdown in specific markets, or retroactive compliance costs.

**Prevention:**
- **Understand your position:** You are reselling data-only eSIM profiles. You do not assign phone numbers, you do not operate network infrastructure, and you do not provide voice services. This generally places you as a **distributor/retailer**, not a telecom operator, in most EU jurisdictions
- **Verify your wholesale provider's licensing** — they should hold the necessary MVNO/MNO licenses. Get written confirmation
- **Terms of service must be clear** — you are a reseller, not the service provider. The underlying telecom service is provided by [provider name]
- **Consumer protection compliance is mandatory regardless:** EU Consumer Rights Directive applies — 14-day withdrawal right (but exemption exists for digital content once delivery begins with consumer consent), clear pricing, pre-contractual information
- **GDPR compliance** — you handle personal data (email, payment info, potentially location via eSIM destination). Privacy policy, data processing agreements with providers, lawful basis for processing
- **VAT/tax: digital services in EU** — you must charge VAT based on customer's location (not yours) under EU VAT OSS (One-Stop Shop) rules for B2C digital services. This is a significant accounting complexity

**Detection:** If you cannot answer "do I need a telecom license in [country]?" with documented evidence, you have not done enough diligence.

**Phase:** Must be researched before launch. Legal/compliance setup in early phases. VAT/OSS registration before first sale.

---

### Pitfall 5: Student Discount Abuse Destroying Margins

**What goes wrong:** You offer 30% student discounts via coupon codes. The codes leak to Reddit, Telegram groups, discount aggregator sites. Non-students use them. Students share them with friends and family. Your effective margin drops from 60% to 30% — still profitable per sale, but you are giving away revenue on every non-student transaction.

**Why it happens:** Coupon-based discount systems are trivially abused. Students are extremely online and share deals aggressively. Discount aggregator sites scrape and publish codes within hours.

**Consequences:** At 30% discount, your margins go from ~60% to ~42% (rough math: if wholesale is 40% of retail, and you discount retail by 30%, your margin shrinks significantly). If 50%+ of purchases use the student code and half of those are non-students, you are losing 15%+ of potential revenue.

**Prevention:**
- **Do not use static coupon codes.** Period. They will leak
- **Lightweight verification options (pick one):**
  - **University email validation** — accept `.edu`, `.ac.uk`, `.edu.pt`, etc. domain emails. Not perfect (alumni keep emails) but high-friction-enough to deter casual abuse. Lowest implementation cost
  - **Student verification service** — UNiDAYS or Student Beans API. They handle verification. Costs per verification but eliminates abuse. Best for scale
  - **Manual verification** — student ID upload, reviewed async. High friction, does not scale, but works for launch
- **Rate limit discounts** — max 2 discounted purchases per verified student account per semester
- **Make the discount meaningful but not catastrophic** — 20% may be the sweet spot. Still compelling for students, less attractive for abuse
- **Unique, single-use codes** tied to verified accounts — generated after verification, expire after use

**Detection:** Monitor discount usage rate. If >40% of all purchases use student discount within the first month, investigate. Compare conversion rates between discounted and full-price — if discount conversion is 10x higher, the code has leaked.

**Phase:** Discount system design in early phases. Verification integration can come in Phase 2 (start with email domain validation, upgrade to UNiDAYS later).

---

## Moderate Pitfalls

---

### Pitfall 6: Device Compatibility as a Support Black Hole

**What goes wrong:** A significant percentage of customers cannot activate their eSIM because their device does not support eSIM, their carrier has locked eSIM functionality, or they do not know how to navigate their device settings. Your WhatsApp support channel becomes 80% "how do I install this?" questions.

**Why it happens:**
- Not all phones support eSIM (budget Android phones, older models)
- Some carriers lock eSIM functionality even on capable hardware (common with carrier-locked phones)
- The eSIM activation flow differs across iOS versions, Android versions, and manufacturers (Samsung vs Google Pixel vs Xiaomi)
- Users do not know their phone's eSIM capability before purchasing

**Prevention:**
- **Pre-purchase device compatibility check** — ask users to identify their device model before purchase. Maintain a compatibility database. Block purchase for incompatible devices with a clear explanation
- **Device-specific setup guides** are a feature in your requirements. Make them genuinely step-by-step with screenshots for top 20 devices (covers 80%+ of users). This is a content investment, not a code investment
- **"Check if your phone supports eSIM" tool** on the landing page — simple instructions to check Settings > Cellular/Mobile > eSIM availability
- **Post-purchase setup wizard** — detect device via user agent, show the correct guide automatically
- **Pre-purchase warning for Android** — eSIM support on Android is fragmented. Be explicit about which Android devices work

**Detection:** Track support ticket categories. If >30% are "how to install" or "doesn't work on my phone," your pre-purchase filtering and guides are insufficient.

**Phase:** MVP must include basic compatibility checking. Comprehensive guides can be Phase 2 content.

---

### Pitfall 7: API Rate Limits and Wholesale Provider Throttling

**What goes wrong:** Your platform grows, or you have a traffic spike (start of university semester in September), and the wholesale provider's API starts returning 429 errors or timing out. Orders fail, QR codes are delayed, and usage queries return stale data.

**Why it happens:** Wholesale eSIM providers are often startups themselves with immature API infrastructure. Rate limits may not be well-documented. Burst traffic patterns (everyone buys on the same day) stress their systems.

**Prevention:**
- **Cache aggressively:** Plan catalogs change infrequently — cache for 1-6 hours. Do not hit the provider API on every page load
- **Queue order processing:** Use a job queue (e.g., database-backed with polling, or a simple Redis queue) for order placement. Do not make the user wait for a synchronous API call to the provider
- **Implement retry with exponential backoff** for all provider API calls
- **Request rate limit documentation** from your provider before signing. Get it in writing: requests per second, per minute, burst limits
- **Monitor API response times and error rates** — set alerts for degradation before it becomes customer-facing
- **Pre-provision popular plans** if the provider supports it — have QR codes ready before purchase for your top-selling plans (not all providers support this)

**Detection:** API error rate dashboard. Alert on >1% error rate or P95 latency >5 seconds.

**Phase:** Architecture decision in Phase 1. Rate limit handling must be in the abstraction layer.

---

### Pitfall 8: Refund Policy That Either Bleeds Money or Kills Trust

**What goes wrong:** Two failure modes:
1. **Too generous:** "Full refund anytime" — users buy plans speculatively, activate them, use some data, then request refunds. You paid the wholesale provider and cannot claw it back
2. **Too strict:** "No refunds" — violates EU consumer protection law, generates chargebacks (customers dispute instead of requesting refund), and destroys trust with a young demographic that expects flexibility

**Why it happens:** Digital goods refunds are genuinely complex. The wholesale provider likely does not refund you for activated eSIMs. But EU law requires a cooling-off period for online purchases.

**Consequences:** Too generous: margin erosion. Too strict: chargebacks, regulatory risk, negative reviews.

**Prevention:**
- **Tiered refund policy:**
  - **Un-activated eSIM:** Full refund, no questions asked. This costs you nothing if the provider allows cancellation of unactivated profiles (most do)
  - **Activated but unused (0 bytes consumed):** Full refund minus a small processing fee. Check with provider if they can deactivate
  - **Activated and partially used:** No cash refund. Offer credit toward a future purchase as goodwill
  - **Activated and >50% used or expired:** No refund
- **EU compliance:** Under Consumer Rights Directive, customers have 14-day withdrawal right for online purchases. However, for digital content, you can request the consumer to **expressly consent** to immediate delivery and **acknowledge** they lose withdrawal rights. Add this to checkout flow: "I agree to immediate delivery and acknowledge I waive my 14-day withdrawal right"
- **Make refund requests easy** — a self-service "Request Refund" button for un-activated eSIMs reduces support load and prevents chargebacks
- **Track refund rates** — healthy is <5%. Above 10%, your product or messaging has a problem

**Detection:** Refund rate by plan type and duration. If semester plans have 3x the refund rate of 7-day plans, the long commitment is scaring customers.

**Phase:** Policy must be defined before launch. Self-service refund flow in Phase 1 or 2.

---

### Pitfall 9: Underestimating Customer Support Volume

**What goes wrong:** You plan for "WhatsApp support" as a lightweight channel. In reality, every confused student generates 3-5 messages. At 100 daily orders with a 30% support contact rate, you are handling 100-150 WhatsApp conversations per day. This is a full-time job within weeks of traction.

**Why it happens:**
- eSIM is still unfamiliar technology for many users
- International students often have language barriers
- Activation issues are time-sensitive (user needs connectivity NOW)
- WhatsApp creates expectation of instant replies

**Consequences:** Slow response times, negative reviews, founder burnout, or unexpected labor costs eating into margins.

**Prevention:**
- **Self-service first:** 80% of support questions are predictable — "how to install," "is my phone compatible," "where is my QR code," "how to top up." Build comprehensive FAQ, setup guides, and an order status page that answers these without human contact
- **Automated WhatsApp responses** for common queries using WhatsApp Business API with keyword detection (not a chatbot — just auto-replies for "install," "QR code," "refund" that link to the right help page)
- **Order status page** that shows: payment confirmed, eSIM provisioning, QR code ready, activation status, data usage. If users can self-diagnose, they do not message you
- **Set WhatsApp response time expectations** — "We typically respond within 2 hours" in the auto-reply. Do not promise instant support you cannot deliver
- **Track and categorize every support request** — use this data to improve self-service content and fix UX gaps

**Detection:** Support contacts per order (target: <0.2). Time to first response. Repeat contact rate.

**Phase:** Self-service help content in Phase 1. WhatsApp automation in Phase 2. Scaling plan needed before aggressive marketing.

---

### Pitfall 10: VAT on Digital Services (EU OSS) Complexity

**What goes wrong:** You sell digital services to consumers across the EU. Under EU VAT rules, you must charge VAT at the rate of the customer's country, not yours. There are 27 different VAT rates. You either ignore this (illegal) or try to handle it manually (unsustainable).

**Why it happens:** The EU's One-Stop Shop (OSS) system was designed to simplify cross-border digital services VAT, but it still requires: determining customer location, applying correct VAT rate, filing quarterly OSS returns, keeping records of location evidence.

**Consequences:** Tax non-compliance in the EU is serious. Penalties, back-taxes, and potential inability to operate.

**Prevention:**
- **Use Stripe Tax or a similar automated tax service** — Stripe Tax handles EU VAT calculation, collection, and reporting. It determines customer location from payment method, IP, and billing address. This is the single best investment for this problem
- **Register for OSS** in one EU member state (your establishment country) to report and pay VAT for all EU B2C digital sales through a single portal
- **Display prices VAT-inclusive** (required for B2C in EU) — your displayed price must include VAT. This means the same plan costs slightly different amounts in different countries, or you absorb the VAT difference in your margin
- **Keep two pieces of location evidence** per transaction (EU requirement) — IP geolocation + billing address is sufficient

**Detection:** If you are selling to EU customers without collecting VAT, you are non-compliant. Period.

**Phase:** Must be solved before first sale. Stripe Tax integration in Phase 1 payment setup.

---

## Minor Pitfalls

---

### Pitfall 11: Assuming All Wholesale Providers Are Equal

**What goes wrong:** You pick a provider based on API documentation quality and pricing, then discover their coverage in your key markets (Portugal, Spain, Germany, France) is patchy, their data speeds are throttled, or their eSIM profiles do not support the networks your users need.

**Prevention:**
- **Test before committing:** Buy and activate eSIMs from your shortlisted providers in your target countries. Test real-world speeds, coverage, and activation reliability
- **Check which underlying MNOs the provider uses** in each country — this determines actual network quality
- **Read their SLA carefully** — uptime guarantees, support response times, escalation procedures
- **Start with two providers** if feasible — primary and fallback

**Phase:** Provider evaluation before Phase 1 development begins.

---

### Pitfall 12: SEO Landing Pages That Cannibalize Each Other

**What goes wrong:** You create `/esim-portugal`, `/esim-lisbon`, `/esim-europe-portugal` and they compete for the same keywords. Google picks one (or none), and your SEO investment is wasted.

**Prevention:**
- **One canonical page per destination country** with clear keyword targeting
- **City pages only if search volume justifies** (check before creating)
- **Use proper canonical tags and internal linking hierarchy**
- **Focus on long-tail: "student eSIM [country]" and "Erasmus eSIM [country]"** — less competition than generic "eSIM [country]"

**Phase:** SEO content strategy before creating landing pages (likely Phase 2-3).

---

### Pitfall 13: Referral Program Gaming

**What goes wrong:** Users create multiple accounts to self-refer, or they refer friends who buy the cheapest plan just to earn the referral credit, then never use the service again.

**Prevention:**
- **Referral credit only awarded after the referred user's eSIM is activated** (not just purchased)
- **Minimum plan value for referral qualification** (e.g., plans above 7-day)
- **Cap referral earnings** per account per period
- **Same payment method / IP detection** to catch self-referrals
- **Credit, not cash** — referral rewards as platform credit reduce fraud incentive

**Phase:** Referral program is not MVP. Design these safeguards when building it (Phase 2-3).

---

### Pitfall 14: Top-Up Flow Confusion

**What goes wrong:** Users do not understand the difference between topping up an existing eSIM (adding data to the same profile) versus buying a new eSIM plan. They accidentally buy a new plan when they meant to top up, or vice versa. This creates support tickets and refund requests.

**Prevention:**
- **Clear UX distinction** between "Top Up" (add data to active eSIM) and "Buy New Plan" (get a new eSIM)
- **Check if the wholesale provider supports top-up** for the eSIM profile — not all do. Some require a new eSIM for additional data
- **Auto-detect active eSIMs** in the user's account and prompt "Top up this plan?" when they browse the same destination
- **Warn before new purchase** if user already has an active eSIM for the same destination

**Phase:** Top-up flow in Phase 1 if provider supports it, Phase 2 otherwise.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Wholesale provider selection | Choosing on API docs alone, ignoring real-world coverage | Test eSIMs in target countries before committing |
| Core platform build | Tight coupling to one provider | Build provider abstraction layer from day one |
| Payment integration | Ignoring chargeback risk for digital goods | Stripe Radar, 3D Secure, clear descriptors, evidence collection |
| QR code delivery | Relying on email-only delivery | In-app QR display + persistent access + WhatsApp backup |
| Student discounts | Static coupon codes | Email domain verification minimum, unique codes |
| Launch | No VAT compliance | Stripe Tax + OSS registration before first sale |
| Scaling | Support volume overwhelm | Self-service tools, automated WhatsApp, order status page |
| Refund policy | Either too generous or too strict | Tiered policy based on activation/usage status |
| SEO pages | Keyword cannibalization | One page per country, clear hierarchy |
| Referral program | Gaming and self-referrals | Activation-gated rewards, same-payment detection |

---

## Sources

- EU Consumer Rights Directive (2011/83/EU) — digital content withdrawal right provisions
- EU VAT One-Stop Shop (OSS) regulations — digital services B2C cross-border rules
- Stripe documentation on chargeback management and Radar rules (training data, MEDIUM confidence)
- GSMA eSIM specifications — LPA activation string format (training data, HIGH confidence)
- PSD2 Strong Customer Authentication requirements (training data, HIGH confidence)
- General domain expertise in telecom reselling, payment processing, and EU regulatory compliance (MEDIUM confidence — regulatory details should be verified with current official sources before implementation)

**Note:** Web search was unavailable during this research session. All findings are based on domain expertise and training data. Regulatory and tax compliance recommendations should be verified with current official sources and ideally with legal counsel before implementation. Confidence on regulatory items is MEDIUM — regulations may have been updated.
