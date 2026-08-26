import 'server-only';
import { createServiceClient } from '@/lib/supabase/service';

/**
 * One line in the live activity feed.
 *
 * Every variant is a statement of fact drawn from a real table — a real order
 * row, or real recorded views. There is no seeded or simulated variant, and
 * there should never be one: the widget is a trust signal, and a trust signal
 * that can be caught looping invented purchases costs more than it earns.
 *
 * When nothing clears the thresholds below, the feed returns an empty array
 * and the widget renders nothing at all. Silence is the honest fallback.
 */
export type ActivityItem =
  | {
      kind: 'purchase';
      destination: string;
      iso: string;
      dataGb: number;
      minutesAgo: number;
      buyerCountry: string | null;
    }
  | { kind: 'viewing_now'; destination: string; iso: string; count: number }
  | { kind: 'viewed_today'; destination: string; iso: string; count: number }
  | { kind: 'bought_this_week'; destination: string; iso: string; count: number };

/**
 * Minimums before a fact is worth stating. Two jobs:
 *
 *  - Credibility. "1 person is viewing Japan" reads as desperate and invites
 *    the reader to wonder whether the number is real at all.
 *  - Anonymity. A "someone in Portugal bought Japan 2 minutes ago" toast on a
 *    day with a single Portuguese order points at one identifiable person.
 *    Locations are only attached once enough orders share the bucket.
 */
const MIN_VIEWING_NOW = 3;
const MIN_VIEWED_TODAY = 8;
const MIN_BOUGHT_THIS_WEEK = 3;
const MIN_ORDERS_TO_SHOW_COUNTRY = 5;

/** Order states where money has actually been taken. */
const PAID_STATUSES = [
  'payment_confirmed',
  'provisioning',
  'provisioned',
  'delivered',
  'active',
  'expired',
];

const RECENT_PURCHASE_WINDOW_HOURS = 48;
const MAX_ITEMS = 12;

type DestinationRef = { name: string; iso_code: string };

function refOf(value: unknown): DestinationRef | null {
  // PostgREST returns an embedded row as an object, or an array when it cannot
  // prove the relationship is to-one. Accept both rather than trusting one.
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== 'object') return null;
  const { name, iso_code } = row as Partial<DestinationRef>;
  return name && iso_code ? { name, iso_code } : null;
}

/**
 * Build the feed.
 *
 * `focusDestinationId` is the destination the visitor is currently looking at,
 * when there is one. Its own view counts are the most relevant thing we can
 * say, so they lead; purchases across the catalogue fill in behind.
 */
export async function getActivityFeed(
  focusDestinationId?: string | null,
): Promise<ActivityItem[]> {
  const supabase = createServiceClient();
  const items: ActivityItem[] = [];

  const now = Date.now();
  const since = (ms: number) => new Date(now - ms).toISOString();

  // --- Real views of the destination being looked at ---------------------
  if (focusDestinationId) {
    const [{ data: dest }, { data: liveRows }, { data: todayRows }] = await Promise.all([
      supabase
        .from('destinations')
        .select('name, iso_code')
        .eq('id', focusDestinationId)
        .maybeSingle(),
      supabase
        .from('destination_views')
        .select('session_id')
        .eq('destination_id', focusDestinationId)
        .gte('seen_at', since(5 * 60 * 1000)),
      supabase
        .from('destination_views')
        .select('session_id')
        .eq('destination_id', focusDestinationId)
        .gte('seen_at', since(24 * 60 * 60 * 1000)),
    ]);

    if (dest) {
      // Distinct sessions, not rows: one visitor pinging for ten minutes is
      // ten rows and exactly one person.
      const liveCount = new Set((liveRows ?? []).map((r) => r.session_id)).size;
      const todayCount = new Set((todayRows ?? []).map((r) => r.session_id)).size;

      if (liveCount >= MIN_VIEWING_NOW) {
        items.push({
          kind: 'viewing_now',
          destination: dest.name,
          iso: dest.iso_code,
          count: liveCount,
        });
      }
      if (todayCount >= MIN_VIEWED_TODAY) {
        items.push({
          kind: 'viewed_today',
          destination: dest.name,
          iso: dest.iso_code,
          count: todayCount,
        });
      }
    }
  }

  // --- Real recent purchases ---------------------------------------------
  const { data: orders } = await supabase
    .from('orders')
    .select('created_at, buyer_country, plans(data_gb, destinations(name, iso_code))')
    .in('status', PAID_STATUSES)
    .gte('created_at', since(RECENT_PURCHASE_WINDOW_HOURS * 60 * 60 * 1000))
    .order('created_at', { ascending: false })
    .limit(MAX_ITEMS);

  const recent = orders ?? [];
  // Country is only attached once enough orders exist to hide inside. Below
  // that it is dropped, and the toast still reads perfectly well without it.
  const showCountry = recent.length >= MIN_ORDERS_TO_SHOW_COUNTRY;

  for (const order of recent) {
    const plan = Array.isArray(order.plans) ? order.plans[0] : order.plans;
    if (!plan) continue;
    const dest = refOf((plan as { destinations?: unknown }).destinations);
    if (!dest) continue;

    items.push({
      kind: 'purchase',
      destination: dest.name,
      iso: dest.iso_code,
      dataGb: (plan as { data_gb: number }).data_gb,
      minutesAgo: Math.max(1, Math.round((now - new Date(order.created_at).getTime()) / 60000)),
      buyerCountry: showCountry ? (order.buyer_country ?? null) : null,
    });
  }

  // --- Real weekly totals, per destination -------------------------------
  const { data: weekOrders } = await supabase
    .from('orders')
    .select('plans(destinations(name, iso_code))')
    .in('status', PAID_STATUSES)
    .gte('created_at', since(7 * 24 * 60 * 60 * 1000));

  const weekly = new Map<string, { destination: string; iso: string; count: number }>();
  for (const order of weekOrders ?? []) {
    const plan = Array.isArray(order.plans) ? order.plans[0] : order.plans;
    const dest = refOf((plan as { destinations?: unknown } | null)?.destinations);
    if (!dest) continue;
    const entry = weekly.get(dest.iso_code) ?? {
      destination: dest.name,
      iso: dest.iso_code,
      count: 0,
    };
    entry.count += 1;
    weekly.set(dest.iso_code, entry);
  }

  for (const entry of weekly.values()) {
    if (entry.count >= MIN_BOUGHT_THIS_WEEK) {
      items.push({ kind: 'bought_this_week', ...entry });
    }
  }

  return items.slice(0, MAX_ITEMS);
}
