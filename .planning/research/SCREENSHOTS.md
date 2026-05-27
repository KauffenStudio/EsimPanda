# eSIM Panda — App Store Screenshot Research

Competitive research for v1 iOS App Store screenshots. Sources: live App Store pages for Airalo, Holafly, Nomad eSIM, Saily, Yesim (fetched 2026-05-27), Apple's current screenshot specifications, and the existing `ASO-KEYWORDS.md` competitive metadata baseline (2026-05-03).

## 1. Apple 2026 spec (the constraints)

- **Required primary set:** 6.9" display, portrait **1320 x 2868 px** (iPhone 17 Pro Max class). Apple now requires the 6.9" set — smaller sizes are auto-downscaled.
- **Formats:** JPEG or PNG, RGB. 1–10 screenshots, max 10.
- **Above the fold on a US App Store listing, the user sees the first ~3 screenshots without horizontal scrolling.** Slots 1–3 carry ~80% of the conversion weight. Slot 1 alone carries roughly half.
- **App Preview video:** allowed, up to 3, 15–30s each, autoplays muted in the listing. Video, if present, occupies slot 1.
- **Caption text overlays:** allowed and standard practice. Apple's OCR reads them as a soft ranking signal (ref: `ASO-KEYWORDS.md` §5.1).
- **No "App Store badge" lookalikes, no fake notifications, no competitor logos.** Real UI strongly preferred; stylised UI inside a device frame is allowed.

## 2. What competitors actually emphasize

Distilled from each competitor's description copy (which mirrors their screenshot caption taglines almost word-for-word):

| Rank | Value prop | Airalo | Holafly | Nomad | Saily | Yesim |
|---|---|---|---|---|---|---|
| 1 | 200+ destinations / global coverage | Yes | Yes | Yes | Yes | Yes |
| 2 | No roaming fees | Yes | Yes | Yes | Yes (lead) | Yes |
| 3 | Install in minutes / instant activation | Yes (lead) | Yes | Yes (5 min) | Yes | Yes |
| 4 | Keep your physical SIM active | Yes | – | Yes | Yes | Yes (2nd line) |
| 5 | Local / regional / global plan choice | Yes | – | Yes | Yes | Yes |
| 6 | Unlimited data plans | – | Yes (lead) | Yes (some) | – | Yes |
| 7 | Price anchor (from $4.50 / $4.99 / etc.) | Yes ($4.50) | – | Yes | – | – |
| 8 | Top up / manage / usage tracking | Yes | Yes | Yes | Yes | Yes |
| 9 | 24/7 multilingual support | – | Yes | – | – | Yes |
| 10 | Brand-trust frame ("by NordVPN") | – | – | – | Yes | – |
| 11 | Security / VPN / ad-block layer | – | – | – | Yes | – |
| 12 | Loyalty / rewards / referral program | – | Yes (HolaCoins) | Yes (Pass) | – | Yes |

**Standard screenshot pattern across the category:** device mockup centered, brand-gradient or photographic travel background, single-line headline caption above or below the device, occasional sub-line. Airalo and Saily are the cleanest (single benefit per slide). Holafly is the most marketing-heavy (price burst, loyalty badges). Nomad's screenshots double as a checklist (numbered "How it works"). Yesim looks the most generic.

**Per-brand read:**
- **Airalo** feels most premium — restrained type, lots of negative space, photo backgrounds, leads with "Affordable, global connection." Slot 1 emphasizes the country picker (their broadest visual moat).
- **Holafly** feels most aggressive — "Unlimited" as a hammer, loyalty/discount badges, busy compositions. Leads with the unlimited proposition and the hotspot use-case.
- **Nomad** feels most utility — "How it works" sequencing, free-trial mention, regional pricing. Screenshots read like a tutorial.
- **Saily** feels most professional — NordVPN's growth team's polish shows. Leads with "Skip the shops, avoid roaming fees." Security layer (ad/tracker blocking, virtual location) is their unique slide and a real differentiator.
- **Yesim** feels generic — no differentiated angle visible in metadata.

## 3. White space — what nobody shows well

These are the gaps where eSIM Panda can plant a flag:

1. **The actual eSIM install moment.** Every competitor says "install in minutes" but none visualize the iOS install sheet (the system modal that appears when you tap the activation link). Showing it removes the #1 install anxiety.
2. **Apple Wallet pass.** Zero competitors surface Wallet integration. It is a credibility signal for iOS-native users.
3. **Student discount as a hero.** No competitor targets students in screenshots. eSIM Panda has 15% off and the keyword wedge (`student`, `erasmus` in `ASO-KEYWORDS.md`) — the screenshot must reflect this.
4. **Concrete savings vs roaming.** Everyone says "no roaming fees." Nobody shows a side-by-side ("$3/day vs $12/MB carrier roaming"). A receipt-style comparison would stand out.
5. **Sign in with Apple as a friction-removal moment.** Trust signal, zero competitors use it visually.
6. **Brand mascot.** Every competitor in the category is brand-flat (logotype + gradient). A character-led illustration system is genuinely uncrowded — the Panda is a real differentiator if shown with restraint (not cartoonish).
7. **Trip-length plans (24h to 6 months).** Saily/Nomad show plan grids but none anchor the *range*. A "from one weekend to one semester" framing is unowned.

## 4. Recommended screenshot concepts (ordered, 7 slides)

Slot order matters — first 3 are above the fold. Front-load the differentiator (Panda + 200+) then the conversion-driving moments (install, wallet, savings, student) then the trust signals.

**Slot 1 — Hero / brand statement**
- Headline: "Travel light. Stay online."
- Subhead: "200+ destinations, one Panda."
- Visual: Panda mascot peeking from behind an iPhone showing the country picker (top 6 destinations as flag tiles: Japan, USA, Spain, Portugal, France, UK). Warm bamboo-green gradient background. Plenty of negative space, mascot small enough to feel premium not toy-like.
- Why: Establishes brand instantly. Country picker visually equals Airalo's strongest slide while adding the mascot moat. "Travel light" ties into the bamboo/panda metaphor and reads as a value-prop, not a gag.

**Slot 2 — The install moment (the gap nobody fills)**
- Headline: "Installed in 2 minutes."
- Subhead: "Tap the link. iOS does the rest."
- Visual: Stylised iOS "Add eSIM" system sheet rendered inside the iPhone frame, with a green checkmark in the corner. The sheet shows the carrier name as "eSIM Panda — Japan 5GB." Panda gives a subtle thumbs-up at the edge.
- Why: Kills the #1 first-time-eSIM anxiety. Differentiates against every competitor who only writes "easy install" in copy.

**Slot 3 — Apple Wallet integration**
- Headline: "Lives in Apple Wallet."
- Subhead: "Boarding pass, hotel, eSIM. One swipe."
- Visual: iPhone showing the Wallet stack with an eSIM Panda pass between a boarding pass and a hotel key. Lock-screen aesthetic, slight motion blur on edges suggesting a swipe.
- Why: Zero competitors show this. Strong iOS-native trust signal. Slots between the install moment (slot 2) and the savings moment (slot 4) as the "it just fits your phone" beat.

**Slot 4 — Savings vs roaming (concrete, not vague)**
- Headline: "$3/day, not $12/MB."
- Subhead: "Prepaid. No carrier surprise."
- Visual: Split screen inside the device frame. Left: roaming carrier bill mock-up with a red highlighted $147.32 line. Right: eSIM Panda receipt showing $9 for 3 days. Clean financial-app aesthetic, not a meme comparison.
- Why: Concrete numbers beat the universal "no roaming fees" caption. This is the most likely "Read More" click trigger for a price-sensitive traveler.

**Slot 5 — Student discount**
- Headline: "Students save 15%."
- Subhead: "Every plan. Every destination."
- Visual: Plan picker UI showing a destination card (e.g. Spain — Erasmus-friendly) with a "Student -15%" badge applied, before/after price (€18 -> €15.30). Backpack icon or subtle Erasmus-coded illustration in background. Panda small in corner.
- Why: Owns the persona wedge zero competitors target. Reinforces the `student`/`erasmus` keyword field in `ASO-KEYWORDS.md` via screenshot OCR.

**Slot 6 — Plan range / flexibility**
- Headline: "A weekend or a semester."
- Subhead: "Plans from 24 hours to 6 months."
- Visual: Horizontal plan picker showing 5 chips: "24h · 7 days · 30 days · 90 days · 180 days" with prices. The 90 and 180 day chips are highlighted as student-popular.
- Why: Anchors the range nobody else anchors. Speaks to both 1-weekend trippers and semester-abroad students in one slide.

**Slot 7 — Trust / sign-in / support close**
- Headline: "Sign in with Apple. Done."
- Subhead: "Live chat in 9 languages. Real humans."
- Visual: Sign in with Apple button prominent, with a small chat bubble overlay showing a support reply. Calm, off-white background. Panda waving at the bottom edge as the closing brand beat.
- Why: Closing trust signal. Removes the "do I have to make an account?" friction. The support line answers the implicit "what if it breaks abroad?" objection without dedicating a whole slide to it.

**Optional Slot 0 — App Preview video (if produced)**
- 20–25 seconds. Screen recording of: country pick → plan select → Apple Pay confirm → install sheet → green "connected" checkmark with haptic-cue waveform. Panda intro card (1s) and outro card (2s with logo + tagline). No voice-over; on-screen captions only, so it works on the muted autoplay.

## 5. Composition rules to apply across all 7

- 6.9" portrait at 1320 x 2868 px, exported as PNG (text crispness matters more than file size).
- One headline, max 6 words, top third. One subhead, max 8 words, directly under. Both bake in keywords for OCR boost (`travel`, `eSIM`, `data`, `roaming`, `Apple Wallet`, `student` distributed across the set).
- Consistent type pairing: a confident sans for headlines (SF Pro Display Bold or similar), regular weight for subheads. Don't mix three families.
- One brand color anchor per slide; rotate hues across the set to avoid the seven-slides-of-green effect (bamboo green for 1, 5, 7; warm sand for 2, 4; charcoal/off-white for 3, 6).
- Device frame: current iPhone 17 Pro silhouette, no real status bar (use a clean 9:41 mock).
- Panda mascot present in 4 of 7 (slots 1, 2, 5, 7), absent from 3, 4, 6 to keep the listing feeling like a product app not a kids' app.
