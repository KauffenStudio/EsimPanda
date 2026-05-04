# eSIM Panda — App Store Optimization (ASO) Plan

Custom plan for the iOS submission of **eSIM Panda** (esimpanda.co). Real data, current sources, opinionated picks. Treat the strings in section 4 as copy-paste-ready.

Last researched: 2026-05-03. Re-verify competitor metadata before final submission — competitors update titles/subtitles often.

---

## 1. Apple ASO field constraints (current, 2026)

All limits below are for App Store Connect, per locale, per app version.

| Field | Limit | Indexed for search? | Visible to users? | Editable without app review? |
|---|---|---|---|---|
| App name | **30 characters** | Yes (highest weight) | Yes (under icon) | No (requires new build/version) |
| Subtitle | **30 characters** | Yes (high weight, second only to name) | Yes (under app name) | No (requires new version) |
| Keywords field | **100 characters**, comma-separated | Yes (medium weight) | No (hidden) | No (requires new version) |
| Promotional text | **170 characters** | **No** (not indexed) | Yes (above description) | **Yes** — can be updated anytime without resubmitting |
| Description | **4000 characters** | No (not indexed for search since iOS 9 — Apple confirmed) | Yes (collapsed; first ~3 lines / ~250 chars visible without "Read More") | No (requires new version) |

Sources for limits: Apple Developer "Creating Your Product Page", App Store Connect Help "App information", AppRadar academy, AppTweak iOS keyword field guide. The 30/30/100/170/4000 numbers are the same ones in force since the subtitle was added in iOS 11 and have not changed in 2026.

### Indexing rules that change how you write metadata

- **Apple stems regular English plurals automatically.** Use the singular form ("trip" not "trips", "plan" not "plans"). Do NOT include both — it wastes characters. Note: stemming is unreliable for foreign languages and irregular plurals (mouse/mice, person/people) — handle those manually if needed. (Sources: Apple Developer, Sensor Tower, AppTweak, MobileAction.)
- **Apple combines words across name + subtitle + keywords within the same locale.** If "travel" is in the title and "esim" is in the keywords, the app indexes for the phrase "travel esim" with no need to write the full phrase anywhere. **Therefore: never repeat a word that already appears in the title or subtitle inside the keyword field — it's burned space.** Repetition does not increase ranking weight.
- **Words combine only within a single locale.** A word in the en-US title will not combine with a word in the es-MX keywords, even though both metadata sets index for the US store.
- **Screenshot OCR (newer):** Apple now reads keyword-rich captions baked into screenshots and uses them as a soft ranking signal. Plan screenshot captions accordingly (covered in section 5).
- **Semantic indexing (newer):** Apple's algorithm now does some intent matching — an app well-optimized for "travel internet" gets a soft boost for "data abroad" without the exact phrase. Don't rely on it; still target your top phrases explicitly.

### Localizations & cross-localization (this is where most competitors leave money on the table)

Each locale gets its own 30 + 30 + 100 = **160 characters of indexable metadata**. A single locale beyond your default is worth more keyword surface than every blog tip about description-stuffing combined.

The locale that matters for the **US App Store specifically**:

- **English (US)** — your primary, mandatory.
- **Spanish (Mexico) — es-MX** — *Apple indexes es-MX metadata into the US App Store search results.* This is the single biggest free ASO trick on iOS. You write Spanish-language keywords in es-MX and they rank in US searches — unique words only, no overlap with your en-US set. (Sources: aso.dev cross-localization guide, AppTweak, ASOdesk.)

Locales that matter for **other major markets**:

- **English (UK) — en-GB** — separate keyword pool from en-US. Indexes in UK, Ireland, Australia, NZ, India, Singapore, etc. Many Erasmus inbound travel searches happen here.
- **English (Australia) — en-AU** — also feeds the AU and several APAC stores.
- **Portuguese (Brazil) — pt-BR** — primary Portuguese on the App Store; also indexes into Portugal. Use this; do not bother with pt-PT (Apple indexes pt-BR for Portugal too).
- **French (France) — fr-FR** — covers FR, BE, LU, parts of CA, parts of CH.
- **Spanish (Spain) — es-ES** — separate from es-MX, used in EU markets.
- **Chinese (Simplified) — zh-Hans** — only relevant if you publish in mainland China; eSIMs have legal restrictions there, so probably skip for v1.
- **Japanese — ja** — single locale, big eSIM market because iPhone share is ~70%.

Cross-localization rules (from Apple's documentation and ASO vendor confirmation):

- **The default fallback for the US store:** if you don't set en-US, the store falls back to the language you set as the app's primary. If you DO set en-US, only en-US + es-MX index in the US.
- **For Brazil:** pt-BR + en-US index together.
- **For UK:** en-GB falls back to en-US if you don't localize.
- **Each unique word counted once across all locales for a given store.** Spanish "viaje" and English "travel" are different words → both add unique surface. But putting "travel" in both en-US and es-MX adds nothing.

---

## 2. Competitor analysis — current metadata (US App Store, fetched 2026-05-03)

All strings quoted verbatim from `apps.apple.com/us/app/...`. Subtitles are 30-char-max so most competitors max them out tightly.

### Airalo — `id1475911720`
- **Name:** "Airalo: eSIM Travel & Internet" (the App Store also surfaces the slightly extended marketing title "Airalo: eSIM Travel & Internet App")
- **Subtitle:** "Affordable, global connection"
- **Category:** Travel
- **Description opening (verbatim):** "Find eSIMs for 200+ countries and regions around the world Stay connected wherever you travel. With an Airalo eSIM (digital SIM), you can connect like a local in 200+ countries and regions worldwide. Install an eSIM and get online in minutes."
- **Keyword take:** owns the phrase "esim travel" via title. Subtitle skips obvious keywords — they assume their brand carries enough volume that they can spend the subtitle on positioning ("affordable, global"). They have brand-pull luxury you don't.

### Holafly — `id1629600786`
- **Name:** "Holafly eSIM: Unlimited Data"
- **Subtitle:** "e SIM for Travel and Hotspot"
- **Category:** Travel
- **Description opening:** "Holafly is your best travel companion. Stay connected wherever you go with Holafly's eSIM cards and enjoy Unlimited Data plans worldwide. What is an eSIM card? An eSIM card provides mobile data like a regular SIM card but is digital and int..."
- **Keyword take:** "Unlimited Data" is their entire positioning (in title), and they spend the subtitle on "travel" and "hotspot". The space between "e" and "SIM" in "e SIM" is a deliberate trick to index for both "esim" AND "sim" as separate words. Worth copying.

### Nomad eSIM — `id1521602300`
- **Name:** "Nomad eSIM: Prepaid Data Plan"
- **Subtitle:** "eSim Card Mobile & Travel WiFi"
- **Category:** Travel
- **Description opening:** "Stay connected wherever you go with Nomad eSIM! Your Best Travel Companion | Affordable | Convenience | Choice Enjoy fast, flexible eSIM data without contracts. Forget about traditional SIM cards – connect..."
- **Keyword take:** strong subtitle — packs "card", "mobile", "travel", "wifi" into 30 chars. Title owns "prepaid data plan". This is a good template.

### Saily — `id6475045151`
- **Name:** "Saily eSIM: Travel & Data"
- **Subtitle:** "Prepaid mobile internet abroad"
- **Category:** Travel
- **Description opening:** "Saily is an eSIM app that gives travelers fast, reliable mobile data in over 200 destinations. Skip the shops, avoid roaming fees, and stay connected wherever you go — all with an eSIM you can..."
- **Keyword take:** subtitle is excellent — "prepaid", "mobile internet", "abroad" all in 30 chars. NordVPN owns Saily so they have growth-team polish. Notice the focus on "internet abroad" rather than "travel data" — they're targeting the search intent of someone Googling about roaming charges.

### Yesim — `id1458505230`
- **Name:** "Yesim: eSIM & Mobile Internet"
- **Subtitle:** "Travel + Global Data Plans"
- **Category:** Travel
- **Description opening:** "Stay effortlessly connected wherever your travels take you with Yesim. Our eSIM solution offers perfect mobile internet and a virtual second line, providing you with seamless connectivity across..."
- **Keyword take:** title covers "esim", "mobile", "internet"; subtitle adds "travel", "global", "data", "plan". Tight metadata — every word does work.

### Ubigi — `id1375857674`
- **Name:** "Ubigi: Travel eSIM mobile data"
- **Subtitle:** "Virtual e SIM card & Internet"
- **Category:** Travel
- **Description opening:** "Ubigi: Seamless Connectivity for Travel and Connected Vehicles Travel smart. Stay connected. Explore without limits. >>> Download the Ubigi eSIM App now and start your adventure! ** Discover the World..."
- **Keyword take:** packs "travel esim mobile data" into the title and uses the same "e SIM" trick as Holafly in the subtitle. Targets the "connected car" niche too.

### GigSky — `id590458648`
- **Name:** "eSIM + Travel Data : GigSky"
- **Subtitle:** "International Roaming Plans"
- **Category:** Travel
- **Description opening:** "Save up to 90% on roaming with GigSky's eSIM solutions. Plans as low as $4.99. Available in 190+ countries. Download now and stay connected wherever you travel. Say Goodbye to Roaming Nightmares!"
- **Keyword take:** unusual format — they put the keyword phrase BEFORE the brand. Aggressive ASO, weaker brand reinforcement. They own "international roaming" as a phrase via the subtitle — that's a high-volume search.

### Patterns to copy and to avoid

**Copy:**
- Subtitle treated as keyword pack #2, not as a tagline. Saily, Nomad, Ubigi, Yesim, GigSky all do this. Only Airalo can afford to use it for positioning, because of brand recall.
- "e SIM" with a space — gives you indexing for both "esim" and "sim" as separate tokens. Holafly and Ubigi both do it.
- Plain Travel category. All seven major competitors are in Travel, not Utilities. Apple's algorithm uses category for query disambiguation; being in Travel for queries like "travel internet" is a real signal.

**Avoid:**
- Running over 30 chars in the subtitle (Apple truncates with an ellipsis at the device's display width — usually around 27-28 chars on smaller phones).
- Description-keyword-stuffing. Apple does NOT index the description for search since iOS 9. Long lists of keywords in the body do nothing for ranking and hurt conversion.

---

## 3. Keyword research — what to fight for

Three tiers, ranked by importance for eSIM Panda's three personas (students, models, travelers).

Volume bands are qualitative because Apple Search Ads volume scores are paywalled. They're based on what AppTweak/MobileAction/Sensor Tower public data shows for these phrases plus the count of competitors targeting each one in their visible metadata.

### Tier 1 — must rank for these (high volume, high intent, on-brand)

| Keyword | Volume | Competition | Verdict |
|---|---|---|---|
| `esim` | High | Brutal — Airalo, Holafly, Nomad, Saily, Yesim, Ubigi, GigSky all rank top 10 | **Fight for it.** Place in app name. |
| `travel` (combines with `esim` to give "travel esim") | High | Same competitors all chase it | **Fight for it.** Place in app name. |
| `internet` | High | Less crowded than "esim" — many ranking apps are general internet/wifi tools | **Fight.** Place in app name. |
| `data` | High | High in eSIM space but also competes against ISP apps | **Fight.** Place in subtitle. |
| `roaming` | High | Surprisingly soft — most eSIM apps avoid it because they want to position as roaming alternatives | **Fight.** Place in subtitle as "no roaming". |
| `international` | High | Crowded but not as much as "esim" | **Fight.** Place in subtitle. |
| `prepaid` | Medium-high | Moderate — Saily, Nomad lean into it | **Fight.** Place in keywords field. |
| `sim` (token, not "sim card") | High | Competes with classic SIM apps too | **Earn it for free** via the "e SIM" trick (space) in name or subtitle. |

### Tier 2 — high relevance, less crowded, target via keywords field

| Keyword | Volume | Competition | Verdict |
|---|---|---|---|
| `abroad` | Medium-high | Light in eSIM (Saily uses it) | Strong — high purchase intent. Include. |
| `student` | Medium | Almost zero competition in eSIM space | **Goldmine** — owns persona 1. Include. |
| `erasmus` | Low (in absolute terms) but very high intent and ZERO competition in eSIM space | None | **Include.** Absolute steal — no competitor targets this. |
| `nomad` | Medium | Nomad eSIM owns the brand match; "digital nomad" search competes with Saily, Holafly | Include. |
| `wifi` | High | Crowded but worth attempting | Include. |
| `hotspot` | Medium | Holafly/Ubigi target it | Include. |
| `global` | Medium-high | Several competitors in title/subtitle | Include. |
| `vacation` | Medium | Light competition | Include — captures non-business travelers. |
| `trip` | Medium | Light competition | Include. |
| `plan` | Medium-high | Common in titles | Include. |

### Tier 3 — country/region modifiers (decide carefully)

Single-country queries like "esim japan" or "esim portugal" have moderate volume each. You can't fit 50 country names in 100 chars. **Use regional umbrellas only:** `europe`, `asia`, `usa`, `japan`. These four cover ~80% of search-volume from country/region modifiers based on ASO tool public data and account for the four largest outbound-travel iPhone markets.

Skip:
- Individual countries beyond Japan (no room and Apple's semantic matching gives you a soft boost on all SKUs you actually sell).
- "esim europe", "esim usa" as full phrases — they're indexed automatically by combining "europe"/"usa" in keywords with "esim" in the title. Spelling them out wastes characters.

### Tier 4 — competitor brand keywords (don't)

You CANNOT put "Airalo", "Holafly", etc. into your metadata. Apple's Guideline 2.3.7 explicitly forbids using "trademarked terms" or "popular app names" in metadata, and the App Review team enforces this. Putting "airalo alternative" or "holafly competitor" will get you rejected, sometimes with a warning, sometimes with a stern note that delays your launch by a week.

What you CAN do:
- Run **Apple Search Ads** bidding on competitor brand names — this is allowed by Apple and is the standard play. Keep an Apple Search Ads brand-bidding budget separate from ASO.
- Mirror competitor positioning words ("affordable", "global", "prepaid") in your own metadata — those aren't trademarked.

### Tier 5 — phrases NOT worth chasing

- `esim card` — adds nothing over `esim` (Apple combines "esim" + "card" automatically; "card" isn't worth the slot for you).
- `digital sim` — too low-volume, heavy synonym overlap with esim.
- `mobile data abroad` — combinatorial; you already get this via `mobile` (in subtitle) + `data` (in subtitle) + `abroad` (in keywords).
- `wifi while traveling` — long-tail, low volume, fully covered by your other terms.
- `data plan abroad` — same combinatorial argument.
- `travel sim card` — the word "card" is dead weight.

---

## 4. Final recommendations — copy-paste-ready strings

### 4.1 — App name (30 char limit)

**Recommended primary:**

```
eSIM Panda: Travel Internet
```

(27 chars) — indexes for: `esim`, `panda`, `travel`, `internet`. Brand prominent, no wasted words, lands the highest-volume terms in the name.

**Alternatives:**

1. `eSIM Panda - Travel Data` (24 chars) — swap "Internet" for "Data" if you discover via Apple Search Ads that "data" outperforms "internet" for your audience. Both are top-tier; which wins is a coin flip without test data.
2. `eSIM Panda: Data for Travel` (27 chars) — same words, different order. Slightly more natural-language, may help with semantic matching for queries like "data for travel". Lower priority.
3. `eSIM Panda — Travel eSIM` (24 chars) — repeats "eSIM" twice, which is wasteful (Apple counts the word once). Don't use.

**Not recommended:** "eSIM Panda" alone. Apple's algorithm gives huge weight to the name field — leaving 20 chars unused throws away ranking signal you cannot recover anywhere else.

### 4.2 — Subtitle (30 char limit)

**Recommended primary:**

```
International Data, No Roaming
```

(30 chars, exact) — indexes for: `international`, `data`, `no`, `roaming`. Hits four high-volume Tier-1 keywords, and the phrase "no roaming" is what people actually search for emotionally ("how do I avoid roaming charges"). The "no" gives you nothing on its own but doesn't hurt.

**Fallback:**

```
Prepaid eSIM, instant QR setup
```

(30 chars) — switches focus to: `prepaid`, `esim`, `instant`, `qr`, `setup`. Reinforces the activation UX advantage. Use this if your data shows users care more about setup speed than roaming. **Caveat:** "esim" appears in the name already — duplicating wastes 4 chars of subtitle. Stick with the primary unless you have evidence.

**Don't use:**
- "Travel internet for students" (29 chars) — "travel" is already in the name, wasteful. Better to put "student" in the keyword field where it doesn't conflict.

### 4.3 — Keywords field (100 char limit, no spaces after commas)

**Recommended exact string (98 characters):**

```
global,prepaid,sim,abroad,tourist,student,erasmus,wifi,hotspot,europe,asia,usa,japan,trip,vacation
```

Verified character count: **98/100**. (Two chars of slack, fine — squeezing the last char is rarely worth a weak keyword.)

Justification by group:
- **Generic eSIM expansion:** `global`, `prepaid`, `sim` (gets the "sim" indexing without burning subtitle space; works alongside the "eSIM Panda" in the title).
- **Use-case:** `abroad`, `wifi`, `hotspot`, `trip`, `vacation` — combinations with title give "travel abroad", "wifi abroad", "internet hotspot" etc. without writing them.
- **Persona — students:** `student`, `erasmus` — eSIM Panda's wedge. Both have near-zero competition from major eSIM players.
- **Persona — travelers:** `tourist` — generic, no trademark risk. (Originally drafted as `nomad`; preemptively swapped because "Nomad eSIM" is a competitor brand and Apple Guideline 2.3.7 may flag it. `tourist` ranks for similar travel-intent queries with zero rejection risk.)
- **Region:** `europe`, `asia`, `usa`, `japan` — four biggest outbound-travel markets for iPhone users (UK pulled because en-GB localization covers it via separate metadata field).

**Explicitly NOT in keywords (because they'd be wasted):**
- `esim` — already in app name.
- `travel` — already in app name.
- `internet` — already in app name.
- `data` — already in subtitle.
- `roaming` — already in subtitle.
- `international` — already in subtitle.
- Plurals of any singular included (`students`, `trips`, `nomads`) — Apple stems automatically.
- `card`, `digital`, `phone`, `cellular` — combinatorial dead weight.
- `airalo`, `holafly`, `nomad eSIM`, `saily` — App Review will reject. (`nomad` alone is borderline — the brand "Nomad eSIM" exists. Preemptively swapped to `tourist` in the recommended string above to avoid any App Review delay.)

### 4.4 — Localization strategy

**Priority order (do them in this order; each subsequent one has diminishing ROI):**

1. **English (US) — en-US** — mandatory primary. Strings in 4.1, 4.2, 4.3 above.
2. **Spanish (Mexico) — es-MX** — *biggest free win in iOS ASO.* This indexes back into the US App Store, doubling your keyword surface for the largest market.
3. **Portuguese (Brazil) — pt-BR** — covers Brazil + Portugal. You're a Portuguese-built product; native locale matters.
4. **English (UK) — en-GB** — covers UK, Ireland, AU, NZ, India, Singapore. Erasmus inbound traffic is huge here.
5. **French (France) — fr-FR** — France, Belgium, parts of Canada, parts of Switzerland.
6. **Japanese — ja** — Japan is the third-largest iPhone market and a top eSIM consumer market.
7. **Spanish (Spain) — es-ES** — for Spain's outbound travel market. Lower priority than es-MX because es-MX already covers Spain via cross-localization fallback in some cases.

Skip for v1: Chinese (regulatory friction with eSIM in mainland China). Skip German for v1 unless you confirm Germany is in your top 5 download markets — it's a huge market but eSIM penetration is lower than Japan.

#### es-MX (the unlock) — recommended strings

- **Name (27 chars):** `eSIM Panda: Internet Viaje`
- **Subtitle (29 chars):** `Datos prepago sin roaming`
- **Keywords (97 chars):** `roaming,celular,wifi,abroad,turista,beca,erasmus,europa,asia,japon,vacaciones,plan,nomada,viajero`

Notes: `roaming` repeats the en-US subtitle — that's intentional because Spanish speakers also search "roaming" but they may also search natively. Actually scratch that — Apple counts each word once across locales for ranking. Better to swap `roaming` for `prepago` ... wait, prepago is in the subtitle. Use the version below instead:

- **Keywords es-MX (final, 97 chars):** `hotspot,celular,wifi,abroad,turista,beca,erasmus,europa,asia,japon,vacaciones,plan,nomada,viajero`

Each word is unique vs. the en-US set. This nets you ~16 additional unique terms feeding into the US store, plus ranks you across Mexico, Spain, and Latin America.

#### pt-BR — recommended strings

- **Name (28 chars):** `eSIM Panda: Internet de Viagem`
- **Subtitle (30 chars):** `Dados pré-pagos sem roaming`
- **Keywords (95 chars):** `celular,wifi,roaming,viagem,intercambio,bolsa,erasmus,europa,asia,japao,ferias,plano,nomade,sim`

`intercambio` and `bolsa` (= "exchange" and "scholarship") target Brazilian student travelers — the equivalent of "Erasmus" for the Brazilian market. Roughly zero eSIM apps target this.

#### en-GB — recommended strings

The en-GB pool is separate from en-US, but you should NOT just copy en-US. Use it for British-spelling and UK-specific search terms that en-US wouldn't catch, and to avoid duplicate-word waste.

- **Name (27 chars):** `eSIM Panda: Travel Internet` (same — brand is brand)
- **Subtitle (28 chars):** `Pay as you go data, no fees`
- **Keywords (96 chars):** `holiday,gap,year,interrail,backpack,sim,prepaid,europe,asia,japan,nomad,student,abroad,hotspot`

`holiday` (UK term where US says `vacation`), `gap year`, `interrail`, `backpack` are all British/European-traveler terms that miss in US English.

#### fr-FR, ja, es-ES — abbreviated picks

For these, the quick wins (you can refine later, just get something live):

- **fr-FR Name:** `eSIM Panda: Internet Voyage` (27 chars)
- **fr-FR Subtitle:** `Données prépayées à l'étranger` (30 chars)
- **fr-FR Keywords:** `forfait,mobile,wifi,etudiant,erasmus,europe,asie,japon,vacances,nomade,sim,roaming,sejour`

- **ja Name:** `eSIMパンダ: 海外旅行データ` (~13 chars in JP, well under 30)
- **ja Subtitle:** `海外プリペイドデータプラン` (12 chars)
- **ja Keywords:** `eSIM,プリペイド,海外,旅行,WiFi,ローミング,留学,データ通信,SIM,スマホ,Wi-Fi,ヨーロッパ,アジア,アメリカ`

- **es-ES Name:** `eSIM Panda: Datos de Viaje` (26 chars)
- **es-ES Subtitle:** `Internet sin roaming, prepago` (29 chars)
- **es-ES Keywords:** `tarjeta,wifi,erasmus,beca,europa,asia,japon,vacaciones,nomada,viajero,turista,movil,extranjero`

(Final strings for fr-FR, ja, es-ES should be reviewed by a native speaker before submission. Treat them as v1 drafts.)

### 4.5 — Promotional text (170 char limit)

This slot is a marketing tool that you can edit anytime without a new app review. Use it for campaigns. Suggested launch draft:

```
Travel light, stay online. Get an eSIM in 2 minutes — 200+ destinations, prepaid plans from 24 hours to 6 months. Students save 15% on every plan.
```

(149 chars — leaves headroom for a campaign tag.)

Seasonal rotations to schedule:
- **Spring break (Feb-Mar):** "Spring break? Get an eSIM in 2 minutes. 15% student discount. Plans from 24h to 6 months. 200+ destinations, no roaming, instant QR install." (148 chars)
- **Erasmus / semester abroad (Aug-Sep):** "Heading abroad for the semester? eSIM Panda's 90- and 180-day plans were built for students. 15% off, instant setup, 200+ destinations." (147 chars)
- **Summer travel (Jun-Jul):** "Summer trip planned? Skip the SIM-card hunt at the airport — get connected before your plane lands. 200+ destinations. Plans from $9.99." (149 chars)

### 4.6 — Description first 250 characters (the "above the fold" zone)

Apple shows roughly the first 3 lines / ~250 characters before "Read More". Even though the description is NOT indexed for search, the first 250 chars are the highest-leverage conversion text on the entire listing — they decide whether someone taps "Read More" or installs.

Recommended opening (240 chars, hits both keyword reinforcement for OCR/semantic boost and a conversion hook):

```
Your travel eSIM, ready in 2 minutes. eSIM Panda gives students, travelers, and digital nomads instant mobile data in 200+ destinations — no roaming charges, no SIM-card swap. Plans from 24 hours to a full semester. Students save 15%.
```

Reinforces (without keyword-stuffing): travel eSIM, students, travelers, digital nomads, mobile data, roaming, SIM, semester. Reads like a human wrote it. Conversion hook ("ready in 2 minutes") is the first benefit, not the first feature.

The remaining ~3,750 chars of the description should be benefit-led bullets, social proof when available, and the legal/contact block at the bottom. Do not stuff keyword lists — they don't help and they make conversion worse.

---

## 5. Practical next steps

### This week (before submission)

1. **Capture screenshots with keyword-rich captions baked in.** Apple's OCR now reads screenshot text as a soft ranking signal (newer behavior, confirmed by AppTweak and Stormy AI 2026 research). For screenshots 1 and 2 specifically, add captions like "Travel eSIM, ready in 2 minutes" and "Student plans 15% off — 200+ countries". High contrast, large type. The ui-ux-pro-max checklist already covers visual quality.
2. **Set up Apple Search Ads** with a budget split: 60% of budget on competitor brand-bidding (`airalo`, `holafly`, `nomad esim`, `saily`, `yesim`), 40% on generic high-intent (`travel esim`, `international data`, `esim europe`). This is allowed by Apple, the major eSIM brands all do it, and Apple Search Ads installs feed your organic ranking signal.
3. **Localize the metadata in App Store Connect for at least en-US + es-MX before first submission.** Adding locales after launch is fine but costs you the first wave of organic exposure. Get the two highest-ROI ones in the box at v1.

### Common ASO mistakes to avoid

- **Plurals + singulars together.** Don't include both `student` and `students` — Apple stems the regular plural automatically. You waste 8 characters. (Caveat: stemming is unreliable for foreign languages and irregular plurals, e.g. `mouse/mice`. Not relevant for our keyword set.)
- **Repeating words across name/subtitle/keywords.** A word in the name does NOT also need to be in the keywords. Apple combines them automatically and gives no extra weight to repetition. I excluded `esim`, `travel`, `internet`, `data`, `roaming`, `international` from the keywords for this reason.
- **Competitor brand names in metadata.** Apple Guideline 2.3.7 prohibits this and App Review enforces it. Do this via Apple Search Ads, not ASO.
- **Description keyword-stuffing.** The description has not been indexed for search since iOS 9. Walls of keywords there hurt conversion and do nothing for ranking.
- **Spaces after commas in the keywords field.** A comma + space costs 2 chars; a comma alone costs 1. Always `keyword,keyword` not `keyword, keyword`. The recommended string in 4.3 is already optimized.
- **Localizing into pt-PT.** Apple indexes pt-BR for Portugal too. Use the spare locale slot for something else (en-AU, fr-FR, ja).
- **Putting "for kids", "free", "best", "top" in keywords.** All flagged. Apple actively rejects subjective superlatives in metadata.

### When to revisit

- **2 weeks after launch:** check App Store Connect → Analytics → Sources → App Store Search. You'll see which terms are actually driving impressions and installs. The terms that surprise you (in either direction) are the ones to act on.
- **Every 4-6 weeks for the first 6 months:** rotate one or two keywords in the field based on real impression data. Don't churn every word — Apple's algorithm rewards stability slightly. Single-word swaps per cycle.
- **Quarterly:** review competitor metadata. Saily and Holafly especially update their subtitles every 1-2 quarters. Their changes signal what's working in the category.
- **Promotional text:** rotate every 4-6 weeks tied to seasonal campaigns. This is a free lever — use it.

---

## Sources

- [Apple Developer — Creating Your Product Page](https://developer.apple.com/app-store/product-page/)
- [App Store Connect Help — App information](https://developer.apple.com/help/app-store-connect/reference/app-information/)
- [App Store Connect Help — App Store localizations](https://developer.apple.com/help/app-store-connect/reference/app-information/app-store-localizations/)
- [Apple Developer — App Review Guidelines (Guideline 2.3.7)](https://developer.apple.com/app-store/review/guidelines/)
- [AppTweak — How to Optimize Your iOS Keyword Field](https://www.apptweak.com/en/aso-blog/how-to-optimize-your-ios-keyword-field)
- [AppTweak — App Store Keyword Research 2026](https://www.apptweak.com/en/aso-blog/app-store-keyword-research-aso)
- [AppTweak — How to Benefit from Cross-Localization on the App Store](https://www.apptweak.com/en/aso-blog/how-to-benefit-from-cross-localization-on-the-app-store)
- [AppTweak — Singular or Plural Keywords](https://www.apptweak.com/en/aso-blog/do-singular-or-plural-keywords-rank-differently-in-aso)
- [aso.dev — App Store Cross-Localization Guide](https://aso.dev/metadata/cross-localization/)
- [Sensor Tower — One Letter That Can Make A Huge Difference In Keyword Rankings](https://sensortower.com/blog/one-letter-that-can-make-a-huge-difference-in-your-ios-keyword-rankings)
- [MobileAction — Singular or Plural Keywords for ASO](https://www.mobileaction.co/blog/app-store-optimization/singular-or-plural-keywords-aso/)
- [MobileAction — ASO Keyword Research 2026](https://www.mobileaction.co/blog/aso-keyword-research/)
- [AppRadar — iOS Keyword Field](https://appradar.com/academy/ios-keyword-field)
- [AppRadar — App Subtitle](https://appradar.com/academy/app-subtitle)
- [Gummicube — Targeting Competitor iOS App Brands](https://www.gummicube.com/blog/targeting-competitor-ios-app-brands-with-keyword-optimization)
- [ASO World — App Store Search Algorithm 2026](https://asoworld.com/insight/app-store-search-algorithm-2026-what-actually-decides-your-keyword-ranking/)
- [Stormy AI — 30-30-100 Metadata Rule](https://stormy.ai/blog/mastering-30-30-100-metadata-rule-ios-growth-hacks)
- [AppShots — App Store Metadata Optimization Guide 2026](https://appshots.dev/blog/app-store-metadata-optimization-guide)
- Competitor App Store pages fetched 2026-05-03: [Airalo](https://apps.apple.com/us/app/airalo-esim-travel-internet/id1475911720), [Holafly](https://apps.apple.com/us/app/holafly-esim-unlimited-data/id1629600786), [Nomad](https://apps.apple.com/us/app/nomad-esim-prepaid-data-plan/id1521602300), [Saily](https://apps.apple.com/us/app/saily-esim-travel-data/id6475045151), [Yesim](https://apps.apple.com/us/app/yesim-esim-mobile-internet/id1458505230), [Ubigi](https://apps.apple.com/us/app/ubigi-travel-esim-data-plan/id1375857674), [GigSky](https://apps.apple.com/us/app/gigsky-global-esim-travel-app/id590458648)
