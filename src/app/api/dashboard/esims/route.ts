import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/api-guard';
import { IS_MOCK } from '@/lib/config/mode';
import { mockDashboardEsims, mockPurchases } from '@/lib/mock-data/dashboard';
import { getOrdersByUser, type OrderRow } from '@/lib/db/orders';
import type { DashboardEsim, PurchaseRecord } from '@/lib/dashboard/types';

const ESIM_STATUSES = ['delivered', 'active', 'expired'];

function orderToEsim(o: OrderRow): DashboardEsim | null {
  if (!o.esim_iccid || !ESIM_STATUSES.includes(o.status)) return null;
  const plan = o.plans;
  const dest = plan?.destinations;
  return {
    id: o.id,
    iccid: o.esim_iccid,
    destination: dest?.name || 'Unknown',
    destination_iso: dest?.iso_code || 'XX',
    status:
      o.status === 'delivered' || o.status === 'active'
        ? ('active' as const)
        : ('expired' as const),
    data_total_gb: plan?.data_gb || 0,
    data_used_gb: 0,
    data_remaining_gb: plan?.data_gb || 0,
    data_remaining_pct: 100,
    expires_at: null,
    activated_at: o.created_at,
    last_usage_check: null,
    plan_name: plan?.name || 'eSIM Plan',
    order_id: o.id,
    wholesale_plan_id: plan?.wholesale_plan_id || '',
  };
}

function orderToPurchase(o: OrderRow): PurchaseRecord {
  const plan = o.plans;
  const dest = plan?.destinations;
  const subtotal = Math.max(0, o.amount_paid_cents - (o.discount_cents ?? 0));
  return {
    id: o.id,
    order_id: o.id,
    date: o.created_at,
    destination: dest?.name || 'Unknown',
    destination_iso: dest?.iso_code || 'XX',
    plan_name: plan?.name || 'eSIM Plan',
    duration_days: plan?.duration_days || 0,
    data_gb: plan?.data_gb || 0,
    amount_paid_cents: o.amount_paid_cents,
    currency: o.currency,
    payment_method: 'card',
    coupon_code: o.coupon_code,
    discount_cents: o.discount_cents ?? 0,
    tax_cents: 0,
    subtotal_cents: subtotal,
    iccid: o.esim_iccid || '',
    status: o.status,
  };
}

export async function GET() {
  const { user, response } = await requireAuth();
  if (response) return response;

  try {
    if (IS_MOCK) {
      return NextResponse.json({
        esims: mockDashboardEsims,
        purchases: mockPurchases,
      });
    }

    const orders = await getOrdersByUser(user!.id);
    const esims = orders
      .map(orderToEsim)
      .filter((e): e is DashboardEsim => e !== null);
    const purchases = orders.map(orderToPurchase);

    return NextResponse.json({ esims, purchases });
  } catch (error) {
    console.error('dashboard/esims GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
