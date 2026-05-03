# iOS Submission Checklist — eSIM Panda

This document tracks every step needed to ship the eSIM Panda iOS app to the
App Store. The web-side scaffolding (Capacitor, JS bridges, AASA file) is
already in place; the rest depends on access to a Mac with Xcode and an
active Apple Developer Program account.

> **Bundle ID:** `co.esimpanda.app` (matches the Android TWA package name)
> **App name:** `eSIM Panda`
> **Web target:** `https://esimpanda.co` (loaded inside WKWebView)

---

## 1 — Prerequisites on your Mac

- [ ] Install **Xcode** (Mac App Store, ~25 GB).
- [ ] Run `sudo xcodebuild -license accept` once.
- [ ] Install **CocoaPods**: `sudo gem install cocoapods`.
- [ ] Verify: `xcodebuild -version` and `pod --version` should both succeed.

## 2 — Apple Developer Program enrolment

- [ ] Sign up at https://developer.apple.com/programs/enroll ($99/year).
- [ ] Choose **Sole Proprietor / Individual** (matches Kauffen Studio's tax setup).
- [ ] Wait for approval (typically 24–48 h).
- [ ] Once approved, note your **Team ID** (10-character string, top-right of developer.apple.com).

## 3 — Scaffold the iOS Xcode project

After Xcode + CocoaPods are installed:

```bash
cd /Users/augustinagapii/Desktop/esim-business
npx cap add ios
npx cap sync ios
```

This creates `/ios/App/` containing the Xcode workspace. Open with:

```bash
npx cap open ios
```

## 4 — Register the App ID

In **developer.apple.com → Certificates, IDs & Profiles → Identifiers**:

- [ ] Click **+** → **App IDs** → **App** → Continue.
- [ ] Description: `eSIM Panda`.
- [ ] Bundle ID: **Explicit** → `co.esimpanda.app`.
- [ ] Capabilities to enable now: **Push Notifications**, **Associated Domains**, **Wallet**.
- [ ] Continue → Register.

## 5 — Wire up Universal Links (already half-done)

The web side already publishes `/.well-known/apple-app-site-association` with
placeholder `TEAMID`. Replace it once you have the Team ID:

- [ ] Open `public/.well-known/apple-app-site-association` in this repo.
- [ ] Replace **both** occurrences of `TEAMID` with your real 10-char Team ID.
- [ ] Commit + push (Vercel auto-deploys, file becomes live at
      `https://esimpanda.co/.well-known/apple-app-site-association`).
- [ ] Verify: `curl -I https://esimpanda.co/.well-known/apple-app-site-association`
      returns `200` with `Content-Type: application/json`.

In Xcode (`ios/App/App.xcworkspace`):

- [ ] Select the `App` target → **Signing & Capabilities** → **+ Capability**
      → **Associated Domains**.
- [ ] Add: `applinks:esimpanda.co` and `webcredentials:esimpanda.co`.

## 6 — Push Notifications config

In **developer.apple.com → Keys**:

- [ ] **+** → name `eSIM Panda APNs` → enable **Apple Push Notifications service (APNs)**
      → Continue → Register → **Download** the `.p8` file (one-time download —
      store in 1Password).
- [ ] Note the **Key ID** (10 chars).
- [ ] Choose where push receipts will be stored on the backend. Two options:
  - Push them straight to Supabase via a new endpoint.
  - Use a third party (OneSignal, Pusher Beams) to abstract APNs entirely.
- [ ] Implement `/api/push/register-device` — the JS helper at
      `src/lib/native/push.ts` already calls it. It should persist
      `(user_id, device_token, platform='ios')` so server-side jobs (eSIM
      expiry, low-data alerts) can target the device.
- [ ] In Xcode: **Signing & Capabilities** → **+ Capability** → **Push Notifications**.

## 7 — Apple Wallet (Add to Wallet button)

Wallet integration doesn't need a Capacitor plugin — the existing webview
handles `.pkpass` MIME types natively. The work is server-side.

In **developer.apple.com → Identifiers → Pass Type IDs**:

- [ ] **+** → **Pass Type ID** → identifier `pass.co.esimpanda.app` → Continue → Register.
- [ ] Generate a Pass Type ID Certificate from a CSR (Keychain Access on Mac
      → Certificate Assistant → Request a Certificate). Download the `.cer`,
      double-click to install, export from Keychain as `.p12`.

On the backend:

- [ ] Add a `/api/wallet/[orderId]/pass` route that returns a signed `.pkpass`
      file using `passkit-generator` (npm). Inputs: order details + the
      `.p12` cert (stored as a Vercel env var, base64-encoded).
- [ ] Add an "Add to Apple Wallet" button on the eSIM detail screen that
      links to that endpoint. iOS opens the Wallet add dialog automatically.

## 8 — App Store Connect listing

In **appstoreconnect.apple.com → My Apps → +**:

- [ ] Bundle ID: `co.esimpanda.app`.
- [ ] App Name: `eSIM Panda`.
- [ ] Primary Language: English.
- [ ] SKU: `esimpanda-ios`.

Required metadata before submission:

- [ ] **App icon** (1024×1024 PNG, no transparency, no rounded corners).
- [ ] **Screenshots** — at least one set for **iPhone 6.7"** (1290×2796) and
      one for **iPhone 6.5"** (1242×2688). Three screenshots minimum, ten max.
- [ ] **Description** (4000 chars max, no emoji in the first 50 chars).
- [ ] **Keywords** (100 chars total, comma-separated).
- [ ] **Support URL**: `https://esimpanda.co/en/support` (need to publish this
      page if it doesn't exist).
- [ ] **Marketing URL**: `https://esimpanda.co`.
- [ ] **Privacy Policy URL**: `https://esimpanda.co/en/privacy`.
- [ ] **Age rating**: complete the questionnaire (likely 4+).
- [ ] **Pricing**: Free.
- [ ] **Availability**: All territories.

App Privacy section (required before review):

- [ ] Declare data types collected: Email Address, User ID, Purchase History.
- [ ] Mark each as **linked to user identity** and used for **App Functionality**.

## 9 — Build & archive in Xcode

- [ ] In Xcode, select the **Any iOS Device (arm64)** destination.
- [ ] **Product** → **Archive** (takes a few minutes).
- [ ] Once archived, Organizer opens. Click **Distribute App** → **App Store
      Connect** → **Upload**.
- [ ] Wait for processing (~10–30 min). Build appears in App Store Connect →
      TestFlight.

## 10 — TestFlight before public launch

- [ ] Add yourself as **Internal Tester**.
- [ ] Install via TestFlight on a real iPhone, complete a live OAuth sign-in,
      verify Universal Link routing (e.g., paste an email link from a recent
      order — should open the app, not Safari).
- [ ] Add 1–2 trusted external testers if possible.

## 11 — Submit for App Store Review

- [ ] In App Store Connect → **App Store** tab → select the build → fill
      review notes (mention test credentials if needed).
- [ ] **Submit for Review**.
- [ ] Typical review turnaround: 24–48 h. If rejected, the most common
      reason is **Guideline 4.2 (Minimum Functionality)** — make sure your
      App Review Notes explicitly call out the native features:
      *"Push notifications, Apple Wallet pass for eSIM QR, Universal Links
      from order emails."*

## 12 — On approval

- [ ] Update `src/lib/config/app-store-links.ts` with the live URL:
      ```ts
      apple: 'https://apps.apple.com/app/idXXXXXXXXX'
      ```
      (where the digits come from App Store Connect → App Information).
- [ ] Commit, push, deploy. The landing-page App Store badge becomes a live
      link.

---

## What's already done in this repo

- ✅ Capacitor runtime packages installed (`@capacitor/core`, `@capacitor/app`,
     `@capacitor/push-notifications`).
- ✅ Capacitor CLI + iOS scaffold packages installed (devDependencies).
- ✅ `capacitor.config.ts` with bundle ID, server URL, and plugin defaults.
- ✅ `src/lib/native/platform.ts` — runtime detection of native vs web.
- ✅ `src/lib/native/push.ts` — APN registration that no-ops in browsers.
- ✅ `src/lib/native/deep-links.ts` — Universal Link → router bridge.
- ✅ `public/.well-known/apple-app-site-association` populated with real Team ID `WBU6X584D3`.
- ✅ `vercel.json` updated to serve the AASA file as `application/json`.

## What still needs to be done

- ❌ Run `npx cap add ios` (requires Xcode).
- ❌ Implement `/api/push/register-device` route (backend).
- ❌ Implement `/api/wallet/[orderId]/pass` route (backend, requires Pass Type ID).
- ❌ Wire `attachDeepLinkRouter` into the layout (one `useEffect`).
- ❌ Wire `registerNativePush` into the layout (one `useEffect`, after auth).
- ❌ Add an "Add to Apple Wallet" button to the eSIM detail screen.
- ❌ Generate App Store screenshots and icons.
- ❌ Submit to App Store Review.
