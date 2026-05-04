'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';

type Status = 'unknown' | 'eligible' | 'not_eligible';

export function useFirstPurchaseStatus(): Status {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const [status, setStatus] = useState<Status>('unknown');

  useEffect(() => {
    if (!initialized) return;
    if (!user) {
      setStatus('not_eligible');
      return;
    }

    let cancelled = false;
    fetch('/api/user/has-purchased', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { has_purchased?: boolean }) => {
        if (cancelled) return;
        setStatus(data.has_purchased ? 'not_eligible' : 'eligible');
      })
      .catch(() => {
        if (!cancelled) setStatus('not_eligible');
      });

    return () => {
      cancelled = true;
    };
  }, [initialized, user]);

  return status;
}
