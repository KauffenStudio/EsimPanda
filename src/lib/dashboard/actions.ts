'use server';

import { isMockMode } from '@/lib/auth/mock';
import { mockDashboardEsims } from '@/lib/mock-data/dashboard';
import type { DashboardEsim } from './types';

export async function fetchDashboardEsims(): Promise<{ esims: DashboardEsim[] }> {
  if (isMockMode()) {
    return { esims: mockDashboardEsims };
  }

  // Production: fetch from API route
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard/esims`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch eSIMs');
  }

  return res.json();
}

export async function refreshEsimUsage(
  iccid: string
): Promise<{
  data_used_gb: number;
  data_total_gb: number;
  data_remaining_gb: number;
  data_remaining_pct: number;
  last_usage_check: string;
}> {
  if (isMockMode()) {
    const esim = mockDashboardEsims.find((e) => e.iccid === iccid);
    if (!esim) throw new Error('eSIM not found');
    return {
      data_used_gb: esim.data_used_gb,
      data_total_gb: esim.data_total_gb,
      data_remaining_gb: esim.data_remaining_gb,
      data_remaining_pct: esim.data_remaining_pct,
      last_usage_check: new Date().toISOString(),
    };
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard/usage?iccid=${encodeURIComponent(iccid)}`,
    { cache: 'no-store' }
  );

  if (!res.ok) {
    throw new Error('Failed to refresh usage');
  }

  return res.json();
}

export async function resendDeliveryEmail(
  orderId: string,
  email: string
): Promise<{ success: boolean }> {
  if (isMockMode()) {
    console.log('[MOCK] resendDeliveryEmail:', orderId, email);
    return { success: true };
  }

  // TODO: Production — call sendDeliveryEmail from src/lib/email/send-delivery.ts
  // import { sendDeliveryEmail } from '@/lib/email/send-delivery';
  // await sendDeliveryEmail({ to: email, orderId });
  return { success: true };
}
