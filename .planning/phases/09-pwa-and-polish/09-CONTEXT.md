# Phase 9: PWA and Polish - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning

<domain>
## Phase Boundary

The platform is installable as a PWA with offline QR code access, supports dark mode with manual toggle, and sends push notifications for eSIM expiry, low data, and promotions. No native app (out of scope), no advanced offline sync (background sync for data refresh only), no user profile/settings page (notification toggles live in a small section on the dashboard).

</domain>

<decisions>
## Implementation Decisions

### PWA Install Experience
- **Install prompt timing:** Custom branded banner shown on the delivery/success page after first purchase. High-motivation moment — user just received an eSIM
- **Prompt style:** Custom in-app banner with Bambu mascot — "Install eSIM Panda for offline QR access" + Install button. Triggers native `beforeinstallprompt` on click
- **App icon:** Panda face (Bambu head) on brand blue (#2979FF) background
- **Splash screen:** Claude's discretion
- **Display mode:** Standalone — no browser UI, feels like a native app
- **Manifest:** Standard PWA manifest with name, short_name, icons (192, 512), theme_color (#2979FF), background_color

### Dark Mode
- **Detection:** Manual toggle only — always starts in light mode. No auto-detection of system preference
- **Toggle location:** Header only (already exists from Phase 1). No settings page
- **Color palette:** Claude's discretion — pick what works best with the blue accent (#2979FF)
- **Mascot in dark mode:** Claude's discretion — decide best approach for Bambu visibility in dark mode
- **Existing code:** `useThemeStore` (Zustand with persist) and `ThemeToggle` component already exist. Phase 9 completes the `dark:` CSS token system across all components

### Push Notifications
- **Permission prompt:** After PWA install only — don't ask web visitors who haven't installed
- **Notification types:**
  - **Expiry warnings:** 24 hours before + 1 hour before eSIM expires. Action button: "Renew"
  - **Low data alerts:** At 80% and 95% data usage. Action button: "Top up now"
  - **Promotions:** New destinations, special offers. Max 2 per month. Action button: "View deal"
- **Action buttons:** Yes — contextual actions per notification type (Renew, Top up now, View deal)
- **User preferences:** Three simple toggles — Expiry alerts, Usage alerts, Promotions. Small section on the dashboard, not a separate settings page
- **Promotional frequency:** Max 2 per month

### Offline QR Access
- **Caching strategy:** Cache QR codes immediately on purchase (service worker caches on delivery page)
- **Offline view:** Same dashboard appearance with cached data. "Offline" badge and last-updated timestamp shown
- **Setup guides:** Cached offline alongside QR codes — available at airports with no connectivity
- **Offline indicator:** Subtle top banner: "You're offline — showing cached data" in muted color. Disappears when back online
- **Auto-sync:** Silent background sync when connectivity returns — refreshes cached data (usage stats, expiry) automatically
- **Cache scope:** Claude's discretion — balance between aggressive (full app shell + data) and conservative (essentials only)

### Claude's Discretion
- Splash screen design (panda + logo text vs. logo only)
- Dark mode color palette (true dark vs. soft dark)
- Bambu mascot dark mode treatment (same, glow, or adjust)
- Service worker caching strategy details (which assets, eviction policy)
- Push notification service choice (Web Push API directly vs. service like OneSignal)
- Notification toggle UI design on dashboard

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing dark mode infrastructure
- `src/stores/theme.ts` — Zustand theme store with persist, `isDark` toggle, `document.documentElement.classList.toggle('dark')`
- `src/components/layout/theme-toggle.tsx` — Animated Sun/Moon toggle with Framer Motion, already in header

### QR code rendering
- `src/components/delivery/delivery-page.tsx` — QR code display on delivery page, cache point for offline

### Dashboard
- `src/components/dashboard/` — eSIM dashboard components, offline view target

### Layout
- `src/app/[locale]/layout.tsx` — Root layout where service worker registration would go
- `next.config.ts` — Next.js config, may need PWA plugin

### Requirements
- `.planning/REQUIREMENTS.md` — UXD-02 (PWA), UXD-03 (dark mode), UXD-04 (push notifications)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **ThemeToggle + useThemeStore**: Dark mode toggle and persistence already built. Phase 9 extends with complete `dark:` CSS tokens
- **Framer Motion**: Used everywhere — install banner animation, offline indicator transitions
- **Zustand stores**: Established pattern — notification preferences store follows same `create()` with `persist`
- **Lucide icons**: Used for all icons — has Wifi, WifiOff, Download, Bell icons for PWA/notification UI
- **qrcode.react**: Client-side QR rendering — canvas data can be cached by service worker

### Established Patterns
- **Mock mode**: All features support NEXT_PUBLIC_*_MOCK=true for dev without external services
- **i18n**: 4-language translation files (en/pt/es/fr) — new keys needed for PWA, dark mode, notifications
- **localStorage**: Already used for theme, device compat, first-visit flags — extend for notification preferences

### Integration Points
- **Delivery page**: Add QR data to service worker cache on purchase
- **Dashboard**: Add notification preference toggles, offline indicator
- **Header**: Theme toggle already present
- **Layout**: Service worker registration, offline indicator banner
- **next.config.ts**: PWA plugin configuration (next-pwa or @serwist/next)

</code_context>

<specifics>
## Specific Ideas

- Install banner appears on the success/delivery page right after QR code — highest motivation moment
- Full dashboard works offline with cached data, not a stripped-down view
- Setup guides cached alongside QR codes for airport/travel scenarios with no connectivity
- Push notifications have contextual action buttons that deep-link to the right page (top-up, renew, promo page)
- Notification preference toggles live on the dashboard, not a separate settings page

</specifics>

<deferred>
## Deferred Ideas

- Auto-detect system dark mode preference — could add later as enhancement
- User profile/settings page — not needed for v1, toggles live on dashboard
- Native app (iOS/Android) — web-first, PWA covers mobile
- Advanced offline sync with conflict resolution — simple background refresh is sufficient
- Notification scheduling/analytics dashboard — future admin feature

</deferred>

---

*Phase: 09-pwa-and-polish*
*Context gathered: 2026-04-25*
