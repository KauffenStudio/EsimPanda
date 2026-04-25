// eSIM Panda Service Worker
const CACHE_NAME = 'esim-panda-v1';
const QR_CACHE_NAME = 'esim-qr-data';

const APP_SHELL_URLS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// --------------------------------------------------
// Install: cache app shell
// --------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_URLS))
  );
  self.skipWaiting();
});

// --------------------------------------------------
// Activate: clean old caches
// --------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== QR_CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// --------------------------------------------------
// Fetch: network strategies with pass-through rules
// --------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Pass through non-GET requests
  if (request.method !== 'GET') return;

  // Pass through Next.js internals, API routes, and third-party services
  if (
    url.pathname.includes('_next/') ||
    url.pathname.includes('api/') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('stripe')
  ) {
    return;
  }

  // Navigation requests: network-first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/') || new Response('Offline', { status: 503 }))
    );
    return;
  }

  // Static assets (images, styles, scripts): cache-first with network fallback
  if (['image', 'style', 'script'].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          })
      )
    );
    return;
  }
});

// --------------------------------------------------
// Push: show notification
// --------------------------------------------------
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body || '',
    icon: '/icon-192x192.png',
    badge: '/badge.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      type: data.type || 'general',
    },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'eSIM Panda', options)
  );
});

// --------------------------------------------------
// Notification click: open relevant page
// --------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  let targetUrl = event.notification.data?.url || '/';

  // Handle action clicks
  if (event.action) {
    const action = event.notification.data?.actions?.find(
      (a) => a.action === event.action
    );
    if (action?.url) {
      targetUrl = action.url;
    }
  }

  event.waitUntil(clients.openWindow(targetUrl));
});

// --------------------------------------------------
// Message: CACHE_QR — store QR data for offline access
// --------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_QR') {
    const { orderId, qrData, setupGuide } = event.data;

    event.waitUntil(
      caches.open(QR_CACHE_NAME).then((cache) => {
        const response = new Response(
          JSON.stringify({ orderId, qrData, setupGuide }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );
        return cache.put(`/api/cached-qr/${orderId}`, response);
      })
    );
  }

  // REFRESH_CACHE — re-fetch app shell when connectivity returns
  if (event.data?.type === 'REFRESH_CACHE') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) =>
        Promise.all(
          APP_SHELL_URLS.map((url) =>
            fetch(url)
              .then((response) => cache.put(url, response))
              .catch(() => {
                /* ignore individual fetch failures */
              })
          )
        )
      )
    );
  }
});
