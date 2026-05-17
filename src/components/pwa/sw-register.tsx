'use client';

import { useEffect, useState } from 'react';
import { UpdateBanner } from './update-banner';

export function SwRegister() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let refreshing = false;

    // Reload once the new SW takes control (after SKIP_WAITING).
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return; // Pitfall 3: guard against double reload
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Case A: a worker is already waiting at page load.
        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(registration.waiting);
        }
        // Case B: a new worker is found while the page is open.
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            // controller check (Pitfall 7) distinguishes an UPDATE from a first install
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              setWaitingWorker(newWorker);
            }
          });
        });
      })
      .catch(() => {
        /* registration failure is non-fatal */
      });
  }, []);

  const handleReload = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    // the controllerchange handler reloads the page once the SW activates
  };

  if (!waitingWorker) return null;
  return (
    <UpdateBanner
      onReload={handleReload}
      onDismiss={() => setWaitingWorker(null)}
    />
  );
}
