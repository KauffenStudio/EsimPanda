'use server';

import { isMockMode } from '@/lib/auth/mock';
import { mockDashboardEsims } from '@/lib/mock-data/dashboard';
import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { decrypt } from '@/lib/delivery/encryption';
import { sendDeliveryEmail } from '@/lib/email/send-delivery';
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

/**
 * Re-send the delivery email for a past order the authenticated user owns.
 *
 * The dashboard purchase-history row only carries the human-readable orderId
 * (`ORD-XXXXXXXX`, generated as `'ORD-' + last 8 of payment_intent_id` upper-
 * cased — see provision.ts:generateOrderId). We resolve it back to a real
 * order by matching the suffix against `stripe_payment_intent_id`, scoped to
 * the requesting user so one user cannot trigger re-sends for someone else.
 *
 * Earlier this action returned `{ success: true }` unconditionally in production —
 * the user saw a success toast but the email never went out.
 */
export async function resendDeliveryEmail(
  orderId: string,
): Promise<{ success: boolean; error?: string; email?: string }> {
  if (isMockMode()) {
    console.log('[MOCK] resendDeliveryEmail:', orderId);
    return { success: true, email: 'mock@example.com' };
  }

  const ssr = await createServerSupabase();
  const { data: authData, error: authError } = await ssr.auth.getUser();
  if (authError || !authData.user) {
    return { success: false, error: 'Not authenticated' };
  }
  const userId = authData.user.id;

  // ORD-XXXXXXXX → last-8-hex suffix of stripe_payment_intent_id. Validate the
  // shape strictly before building an ILIKE pattern; never interpolate the raw
  // input into the query.
  const suffixUpper = orderId.replace(/^ORD-/, '');
  if (!/^[A-Z0-9]{8}$/.test(suffixUpper)) {
    return { success: false, error: 'Invalid order id' };
  }
  const suffixLower = suffixUpper.toLowerCase();

  const supabase = createServiceClient();
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(
      `id, email, amount_paid_cents, currency, status, esim_qr_encrypted, stripe_payment_intent_id,
       plans ( name, data_gb, duration_days, destinations ( name, iso_code ) )`,
    )
    .eq('user_id', userId)
    .ilike('stripe_payment_intent_id', `%${suffixLower}`)
    .eq('status', 'delivered')
    .maybeSingle();

  if (orderError || !order || !order.esim_qr_encrypted) {
    return { success: false, error: 'Order not found or not delivered' };
  }

  let credentials: { activation_code?: string; smdp_address?: string };
  try {
    credentials = JSON.parse(decrypt(order.esim_qr_encrypted));
  } catch {
    return { success: false, error: 'Stored credentials unreadable' };
  }
  if (!credentials.activation_code || !credentials.smdp_address) {
    return { success: false, error: 'Stored credentials incomplete' };
  }

  // The Supabase typed-query helper widens the joined rows to arrays in some
  // schema setups; pick the first element if so, otherwise treat as object.
  type Joined = { name?: string; data_gb?: number; duration_days?: number; destinations?: { name?: string; iso_code?: string } };
  const planRaw = order.plans as unknown as Joined | Joined[] | null;
  const plan: Joined | null = Array.isArray(planRaw) ? planRaw[0] ?? null : planRaw;
  const destRaw = plan?.destinations as unknown as { name?: string; iso_code?: string } | Array<{ name?: string; iso_code?: string }> | undefined;
  const destination = Array.isArray(destRaw) ? destRaw[0] : destRaw;

  const result = await sendDeliveryEmail({
    to: order.email,
    orderId,
    planName: plan?.name ?? 'eSIM',
    destination: destination?.name ?? 'Your destination',
    dataGb: plan?.data_gb != null ? String(plan.data_gb) : '-',
    durationDays: plan?.duration_days != null ? String(plan.duration_days) : '-',
    smdpAddress: credentials.smdp_address,
    activationCode: credentials.activation_code,
    amountPaid: (order.amount_paid_cents / 100).toFixed(2),
    currency: order.currency,
  });

  if (!result.ok) {
    return { success: false, error: 'Failed to send email' };
  }
  return { success: true, email: order.email };
}
