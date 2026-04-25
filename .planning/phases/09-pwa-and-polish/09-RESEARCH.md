# Phase 9: PWA and Polish - Research

**Researched:** 2026-04-25
**Domain:** Progressive Web App, Dark Mode, Push Notifications
**Confidence:** HIGH

## Summary

Phase 9 converts the eSIM Panda platform into an installable PWA with offline QR code access, completes the dark mode token system across all 80 components, and implements push notifications with VAPID-based Web Push API. The project already has Tailwind v4 dark mode infrastructure (`@variant dark` in globals.css, `useThemeStore` with Zustand persist, animated `ThemeToggle` component), but only 20 of 80 components have `dark:` classes -- the remaining 60 need treatment.

For PWA/service worker, the project uses Turbopack for dev (`next dev --turbopack`). Serwist now supports Turbopack via `@serwist/turbopack` (v9.5.7), but this is separate from the webpack-based `@serwist/next`. Alternatively, the official Next.js PWA guide shows a manual approach with a hand-written `public/sw.js` and `app/manifest.ts` -- this is simpler, fully Turbopack-compatible, and sufficient for our caching + push notification needs. Given the project's mock-mode patterns and the fact that we only need to cache QR codes + app shell (not complex offline-first sync), the manual approach is recommended.

**Primary recommendation:** Use the official Next.js PWA pattern (manual service worker + `app/manifest.ts`) rather than Serwist, to avoid bundler complexity. Use `web-push` (v3.6.7) for VAPID-based server-side push. Complete dark mode by adding `dark:` classes to all 60 remaining components using the existing token system.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Install prompt: Custom branded banner on delivery/success page after first purchase with Bambu mascot
- Prompt triggers native `beforeinstallprompt` on click
- App icon: Panda face on brand blue (#2979FF) background
- Display mode: Standalone
- Dark mode: Manual toggle only, always starts light, NO auto-detection of system preference
- Toggle location: Header only (existing ThemeToggle component)
- Existing `useThemeStore` (Zustand with persist) and `ThemeToggle` already built -- Phase 9 completes `dark:` CSS across all components
- Push permission prompt: After PWA install only -- don't ask web visitors who haven't installed
- Notification types: Expiry warnings (24h + 1h before), Low data alerts (80% + 95%), Promotions (max 2/month)
- Action buttons: Contextual per type (Renew, Top up now, View deal)
- Notification preferences: Three toggles on dashboard (Expiry alerts, Usage alerts, Promotions) -- not separate settings page
- Offline QR: Cache on purchase, same dashboard with "Offline" badge and last-updated timestamp
- Setup guides cached alongside QR codes
- Offline indicator: Subtle top banner "You're offline -- showing cached data"
- Auto-sync: Silent background sync on reconnect

### Claude's Discretion
- Splash screen design (panda + logo text vs. logo only)
- Dark mode color palette (true dark vs. soft dark)
- Bambu mascot dark mode treatment (same, glow, or adjust)
- Service worker caching strategy details (which assets, eviction policy)
- Push notification service choice (Web Push API directly vs. OneSignal)
- Notification toggle UI design on dashboard

### Deferred Ideas (OUT OF SCOPE)
- Auto-detect system dark mode preference
- User profile/settings page
- Native app (iOS/Android)
- Advanced offline sync with conflict resolution
- Notification scheduling/analytics dashboard
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UXD-02 | App is installable as PWA (add to home screen) | Manual service worker + manifest.ts pattern from official Next.js docs; beforeinstallprompt API for custom install banner |
| UXD-03 | App supports dark mode (auto-detect + manual toggle) | Existing useThemeStore + ThemeToggle; Tailwind v4 @variant dark already configured; 60 components need dark: classes. NOTE: User locked manual-only (no auto-detect) |
| UXD-04 | User receives push notifications for eSIM expiry and promotions | Web Push API with VAPID keys; web-push npm package for server-side; service worker push event handler with action buttons |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| web-push | 3.6.7 | Server-side push notification delivery via VAPID | Official Web Push protocol implementation, used in Next.js official PWA guide |
| serwist | 9.5.7 | *Not recommended* -- see Alternatives | Would add bundler complexity for limited benefit |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none new) | - | Service worker is hand-written | Manual sw.js per Next.js official guide |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual SW | @serwist/next + @serwist/turbopack | More powerful caching strategies but adds bundler plugin complexity; project uses Turbopack for dev so needs @serwist/turbopack, not @serwist/next (webpack). Manual SW is simpler for our limited caching needs |
| web-push | OneSignal / Firebase FCM | Managed services add external dependency and dashboard; web-push is direct, free, no vendor lock-in, and follows project's self-contained pattern |

**Installation:**
```bash
npm install web-push
```

**Version verification:** web-push@3.6.7 confirmed via npm registry 2026-04-25.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── manifest.ts           # PWA manifest (Next.js convention)
│   └── actions/
│       └── push.ts            # Server actions for push subscribe/unsubscribe/send
├── components/
│   ├── pwa/
│   │   ├── install-banner.tsx # Custom install prompt with Bambu mascot
│   │   ├── offline-indicator.tsx # "You're offline" top banner
│   │   └── push-manager.tsx   # Push subscription management
│   └── dashboard/
│       └── notification-prefs.tsx # Three notification toggles
├── stores/
│   ├── theme.ts               # (existing) Dark mode toggle
│   └── notifications.ts      # Notification preferences (Zustand + persist)
├── lib/
│   └── push/
│       ├── vapid.ts           # VAPID key config
│       └── send.ts            # Server-side push sending utility
└── styles/
    └── globals.css            # (existing) Dark mode tokens
public/
├── sw.js                      # Service worker (hand-written)
├── icon-192x192.png           # PWA icon
├── icon-512x512.png           # PWA icon
└── badge.png                  # Notification badge icon
```

### Pattern 1: Manual Service Worker with Selective Caching
**What:** Hand-written `public/sw.js` that handles push events, caches the app shell, and selectively caches QR code data on the delivery page.
**When to use:** When caching needs are simple and well-defined (app shell + specific data).
**Example:**
```javascript
// public/sw.js
const CACHE_NAME = 'esim-panda-v1';
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first with cache fallback for navigation
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/'))
    );
    return;
  }
  // Cache-first for static assets
  if (event.request.destination === 'image' || event.request.destination === 'style') {
    event.respondWith(
      caches.match(event.request).then((r) => r || fetch(event.request))
    );
  }
});

// Push notifications with action buttons
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge.png',
    vibrate: [100, 50, 100],
    data: { url: data.url, type: data.type },
    actions: data.actions || [],
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click with action routing
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.action
    ? event.notification.data.url  // action button clicked
    : '/';                          // notification body clicked
  event.waitUntil(clients.openWindow(url));
});
```
Source: [Next.js official PWA guide](https://nextjs.org/docs/app/guides/progressive-web-apps), [MDN ServiceWorkerRegistration.showNotification](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification)

### Pattern 2: beforeinstallprompt with Custom Banner
**What:** Intercept the browser's native install prompt and trigger it from a custom branded banner.
**When to use:** When you want full control over install prompt timing and UI.
**Example:**
```typescript
// src/components/pwa/install-banner.tsx
'use client';
import { useState, useEffect } from 'react';

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
    
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (isStandalone || !isVisible) return null;

  return (
    <div className="...">
      {/* Bambu mascot + "Install eSIM Panda for offline QR access" */}
      <button onClick={handleInstall}>Install</button>
    </div>
  );
}
```
Source: [MDN beforeinstallprompt](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event)

### Pattern 3: Dark Mode Token System with CSS Variables
**What:** Use Tailwind v4's `@variant dark` with CSS custom properties for semantic color tokens that flip in dark mode.
**When to use:** When you have a design system with many components sharing the same color semantics.
**Example:**
```css
/* globals.css -- extend existing @theme */
@variant dark (&:where(.dark, .dark *));

@theme {
  /* Existing light tokens */
  --color-background: #FFFFFF;
  --color-surface: #F5F5F5;
  --color-border: #E5E5E5;
  /* Dark tokens already defined */
  --color-background-dark: #111111;
  --color-surface-dark: #1A1A1A;
  --color-border-dark: #2A2A2A;
}
```
```tsx
// Component usage pattern
<div className="bg-background dark:bg-background-dark border-border dark:border-border-dark">
  <p className="text-primary dark:text-gray-100">Content</p>
</div>
```

### Pattern 4: QR Code Offline Caching via postMessage
**What:** After QR code renders on delivery page, send QR data to service worker for caching via Cache API.
**When to use:** When specific dynamic data needs to be cached for offline access.
**Example:**
```typescript
// On delivery page, after QR renders:
async function cacheQRData(orderId: string, qrData: string, setupGuide: object) {
  const cache = await caches.open('esim-qr-data');
  const response = new Response(JSON.stringify({ qrData, setupGuide, cachedAt: Date.now() }));
  await cache.put(`/api/cached-qr/${orderId}`, response);
}
```

### Anti-Patterns to Avoid
- **Requesting push permission on first visit:** Only ask after PWA install (per user decision). Non-installed visitors should never see a permission prompt.
- **Caching everything:** Don't cache API responses for catalog or checkout -- only cache QR codes, setup guides, and app shell.
- **Forgetting iOS limitations:** iOS Safari supports PWA install but does NOT support the `beforeinstallprompt` event. Need a fallback instruction for iOS users ("tap Share, then Add to Home Screen").
- **Using `prefers-color-scheme` media query:** User explicitly decided manual-only dark mode. Do NOT add `@media (prefers-color-scheme: dark)` anywhere.
- **Service worker caching Stripe/Supabase calls:** Never cache authenticated or payment API calls.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| VAPID key generation | Manual crypto | `web-push generate-vapid-keys` CLI | Correct key format, proven implementation |
| Push payload encryption | Custom encryption | `web-push` library | Web Push protocol is complex (RFC 8291), library handles it |
| PWA manifest | Manual JSON file | `app/manifest.ts` (Next.js convention) | Type-safe, can be dynamic, auto-linked by Next.js |
| Notification preference storage | Custom localStorage | Zustand store with persist (same pattern as theme) | Consistent with project patterns |
| Service worker registration | Manual registration code | Standard `navigator.serviceWorker.register` | Simple enough; no library needed |

**Key insight:** The PWA domain has well-established browser APIs (Service Worker, Cache API, Push API, beforeinstallprompt). Libraries like Serwist add value for complex caching strategies, but for our scope (app shell + QR data + push), the native APIs are sufficient and avoid bundler plugin complexity.

## Common Pitfalls

### Pitfall 1: Service Worker Scope Mismatch
**What goes wrong:** Service worker registered at `/sw.js` but with wrong scope, causing it to not intercept requests for the full app.
**Why it happens:** Next.js i18n rewrites URLs to `/en/...`, `/pt/...` etc. Service worker at `/` scope covers all paths.
**How to avoid:** Register with `scope: '/'` explicitly. Ensure the SW file is at the root of `public/`.
**Warning signs:** Offline mode works for some pages but not others.

### Pitfall 2: beforeinstallprompt Not Firing
**What goes wrong:** Custom install banner never appears because the event never fires.
**Why it happens:** Criteria not met: needs HTTPS, valid manifest, registered service worker, and user engagement heuristic. Also does NOT fire on iOS Safari.
**How to avoid:** Test on Chrome/Edge first (reliable support). For iOS, show manual instructions. For development, use `--experimental-https`.
**Warning signs:** Works in Chrome but not Safari/Firefox.

### Pitfall 3: Push Subscription Persistence
**What goes wrong:** User subscribes to push, but subscription is lost on service worker update.
**Why it happens:** Service worker lifecycle -- new SW activates, old subscription may be associated with old registration.
**How to avoid:** Re-check subscription on every SW activation event. Store subscription server-side (keyed by user email) and re-subscribe if needed.
**Warning signs:** Notifications stop working after deploying new service worker version.

### Pitfall 4: Dark Mode Flash on Hydration
**What goes wrong:** Page loads in light mode, then flashes to dark mode when Zustand store hydrates from localStorage.
**Why it happens:** SSR renders without localStorage; client hydration adds `dark` class after paint.
**How to avoid:** Add an inline `<script>` in the `<head>` (before any rendering) that reads localStorage and applies the `dark` class synchronously. This runs before React hydration.
**Warning signs:** Brief white flash when dark mode is active.

### Pitfall 5: Cache Invalidation After Deploy
**What goes wrong:** Users see stale cached content after a new deployment.
**Why it happens:** Service worker serves cached app shell indefinitely.
**How to avoid:** Version the cache name (e.g., `esim-panda-v2`). On activate event, delete old caches. Set `Cache-Control: no-cache` header on `sw.js` file to ensure browser always checks for updates.
**Warning signs:** Users report seeing old UI after you deployed changes.

### Pitfall 6: Next.js App Router and Service Worker Conflicts
**What goes wrong:** Service worker caches RSC (React Server Component) payloads, breaking navigation.
**Why it happens:** Next.js App Router uses RSC payloads for navigation (not full HTML). Caching these is dangerous.
**How to avoid:** Only cache static assets and explicit QR data. Use `fetch` event handler that passes through all non-GET and all `_next/` requests to network.
**Warning signs:** Navigation breaks after going offline and back online.

## Code Examples

### PWA Manifest (Next.js Convention)
```typescript
// src/app/manifest.ts
import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'eSIM Panda - Travel eSIM Plans',
    short_name: 'eSIM Panda',
    description: 'Get connected with mobile data anywhere in the world',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#2979FF',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
```
Source: [Next.js manifest docs](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/manifest)

### VAPID Key Generation
```bash
npx web-push generate-vapid-keys
# Add to .env.local:
# NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
# VAPID_PRIVATE_KEY=...
```

### Push Server Action
```typescript
// src/app/actions/push.ts
'use server';
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:sovietic.1978@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function subscribeUser(sub: PushSubscriptionJSON) {
  // In mock mode: store in memory Map
  // In production: store in Supabase push_subscriptions table
  return { success: true };
}

export async function sendPushNotification(
  subscription: PushSubscriptionJSON,
  payload: { title: string; body: string; url: string; type: string; actions: Array<{ action: string; title: string }> }
) {
  await webpush.sendNotification(
    subscription as any,
    JSON.stringify(payload)
  );
}
```

### Notification Preferences Store
```typescript
// src/stores/notifications.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationPrefs {
  expiryAlerts: boolean;
  usageAlerts: boolean;
  promotions: boolean;
  setExpiryAlerts: (v: boolean) => void;
  setUsageAlerts: (v: boolean) => void;
  setPromotions: (v: boolean) => void;
}

export const useNotificationStore = create<NotificationPrefs>()(
  persist(
    (set) => ({
      expiryAlerts: true,
      usageAlerts: true,
      promotions: true,
      setExpiryAlerts: (v) => set({ expiryAlerts: v }),
      setUsageAlerts: (v) => set({ usageAlerts: v }),
      setPromotions: (v) => set({ promotions: v }),
    }),
    { name: 'esim-panda-notifications' }
  )
);
```

### Dark Mode Hydration Fix (Inline Script)
```typescript
// In src/app/layout.tsx <head>
<script dangerouslySetInnerHTML={{ __html: `
  try {
    const stored = JSON.parse(localStorage.getItem('esim-panda-theme') || '{}');
    if (stored.state?.isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    }
  } catch (e) {}
`}} />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-pwa (deprecated) | Serwist or manual SW | 2024 | next-pwa no longer maintained; Serwist is spiritual successor |
| @serwist/next (webpack only) | @serwist/turbopack for Turbopack users | Serwist 9.x (2025) | Turbopack support added as separate package |
| Manual SW only option for Next.js | Official Next.js PWA guide published | Late 2024 | Next.js docs now have first-party PWA guidance |
| Tailwind v3 darkMode config | Tailwind v4 @variant dark in CSS | 2025 | Dark mode configured in CSS, not tailwind.config |
| Google GCM for push | Web Push API with VAPID | 2018+ | No Google dependency, VAPID is the standard |

**Deprecated/outdated:**
- `next-pwa` (shadowwalker/next-pwa): Unmaintained, do not use
- `@ducanh2912/next-pwa`: Superseded by Serwist, migration recommended
- Tailwind `darkMode: 'class'` config: Replaced by `@variant dark` in v4

## Open Questions

1. **Mock mode for push notifications**
   - What we know: Project uses NEXT_PUBLIC_*_MOCK=true pattern for all external services
   - What's unclear: How to simulate push notifications in dev without VAPID keys or HTTPS
   - Recommendation: Mock the server action to show a local toast notification (via Sonner) instead of actual push. Add NEXT_PUBLIC_PUSH_MOCK=true flag.

2. **Push subscription storage in mock mode**
   - What we know: No Supabase connection during dev (per project constraint)
   - What's unclear: Where to persist push subscriptions in mock mode
   - Recommendation: In-memory Map in server action (same pattern as Phase 4 provisioning state). Production migrates to Supabase table.

3. **iOS PWA install flow**
   - What we know: `beforeinstallprompt` does not fire on iOS Safari. iOS requires manual "Add to Home Screen" via Share menu
   - What's unclear: Whether iOS 16.4+ push notification support works reliably in PWA mode
   - Recommendation: Detect iOS and show manual install instructions. Push notifications on iOS PWA are supported since 16.4 but may have quirks -- flag for manual testing.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 + jsdom |
| Config file | vitest.config.ts |
| Quick run command | `npm test -- --run` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UXD-02 | Manifest returns correct fields | unit | `npx vitest run src/app/__tests__/manifest.test.ts` | No - Wave 0 |
| UXD-02 | Install banner shows on delivery page and hides when standalone | unit | `npx vitest run src/components/pwa/__tests__/install-banner.test.ts` | No - Wave 0 |
| UXD-03 | Theme store toggles dark class on document | unit | `npx vitest run src/stores/__tests__/theme.test.ts` | No - Wave 0 |
| UXD-03 | Dark mode classes applied to key components | unit | `npx vitest run src/components/__tests__/dark-mode.test.ts` | No - Wave 0 |
| UXD-04 | Push subscribe/unsubscribe actions work | unit | `npx vitest run src/app/actions/__tests__/push.test.ts` | No - Wave 0 |
| UXD-04 | Notification preferences store persists | unit | `npx vitest run src/stores/__tests__/notifications.test.ts` | No - Wave 0 |
| UXD-02 | Service worker registers and caches app shell | manual-only | Browser DevTools > Application > Service Workers | N/A |
| UXD-02 | Offline QR access works after install | manual-only | Toggle offline in DevTools, check dashboard | N/A |
| UXD-04 | Push notification appears with action buttons | manual-only | Requires HTTPS + browser permission | N/A |

### Sampling Rate
- **Per task commit:** `npm test -- --run`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/app/__tests__/manifest.test.ts` -- covers UXD-02 manifest correctness
- [ ] `src/components/pwa/__tests__/install-banner.test.ts` -- covers UXD-02 install flow
- [ ] `src/stores/__tests__/theme.test.ts` -- covers UXD-03 toggle behavior
- [ ] `src/stores/__tests__/notifications.test.ts` -- covers UXD-04 preference persistence
- [ ] `src/app/actions/__tests__/push.test.ts` -- covers UXD-04 subscribe/send

## Sources

### Primary (HIGH confidence)
- [Next.js official PWA guide](https://nextjs.org/docs/app/guides/progressive-web-apps) - manifest.ts, service worker, push notifications, VAPID setup (updated 2026-04-23)
- [MDN ServiceWorkerRegistration.showNotification](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification) - notification action buttons API
- [MDN NotificationEvent.action](https://developer.mozilla.org/en-US/docs/Web/API/NotificationEvent/action) - action button click handling
- [Tailwind CSS v4 dark mode docs](https://tailwindcss.com/docs/dark-mode) - @variant dark pattern
- npm registry - verified versions: web-push@3.6.7, @serwist/next@9.5.7, @serwist/turbopack@9.5.7

### Secondary (MEDIUM confidence)
- [Serwist Next.js getting started](https://serwist.pages.dev/docs/next/getting-started) - verified setup pattern
- [Next.js Serwist turbopack discussion](https://github.com/serwist/serwist/issues/54) - turbopack support status

### Tertiary (LOW confidence)
- iOS 16.4+ PWA push notification reliability -- needs manual testing validation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - verified against npm registry and official docs
- Architecture: HIGH - follows Next.js official patterns + established project conventions
- Pitfalls: HIGH - well-documented browser API edge cases
- Dark mode: HIGH - existing infrastructure verified in codebase (20/80 components already have dark: classes)

**Research date:** 2026-04-25
**Valid until:** 2026-05-25 (stable APIs, no fast-moving changes expected)
