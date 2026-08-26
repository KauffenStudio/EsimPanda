import { createServiceClient } from '@/lib/supabase/service';

export interface CreateOrderParams {
  user_id?: string;
  buyer_country?: string;
  email: string;
  plan_id: string;
  stripe_payment_intent_id: string;
  amount_paid_cents: number;
  currency?: string;
  coupon_code?: string;
  discount_cents?: number;
}

export interface OrderRow {
  id: string;
  user_id: string | null;
  email: string;
  plan_id: string;
  stripe_payment_intent_id: string;
  amount_paid_cents: number;
  currency: string;
  coupon_code: string | null;
  discount_cents: number;
  status: string;
  esim_iccid: string | null;
  esim_status: string | null;
  esim_qr_encrypted: string | null;
  esim_activation_code_encrypted: string | null;
  esim_smdp_address_encrypted: string | null;
  created_at: string;
  updated_at: string;
  // Joined plan data (when using select with plans)
  plans?: {
    wholesale_plan_id: string;
    name: string;
    data_gb: number;
    duration_days: number;
    destinations?: {
      name: string;
      iso_code: string;
    };
  };
}

export async function createOrder(params: CreateOrderParams): Promise<OrderRow | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: params.user_id || null,
      email: params.email,
      plan_id: params.plan_id,
      stripe_payment_intent_id: params.stripe_payment_intent_id,
      amount_paid_cents: params.amount_paid_cents,
      currency: params.currency || 'USD',
      coupon_code: params.coupon_code || null,
      discount_cents: params.discount_cents || 0,
      buyer_country: params.buyer_country || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('createOrder error:', error);
    return null;
  }
  return data;
}

export async function getOrderByPaymentIntent(paymentIntentId: string): Promise<OrderRow | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      plans (
        wholesale_plan_id,
        name,
        data_gb,
        duration_days,
        destinations (
          name,
          iso_code
        )
      )
    `)
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single();

  if (error) {
    console.error('getOrderByPaymentIntent error:', error);
    return null;
  }
  return data;
}

export async function getOrderByIdForUser(
  orderId: string,
  userId: string,
): Promise<OrderRow | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      plans (
        wholesale_plan_id,
        name,
        data_gb,
        duration_days,
        destinations (
          name,
          iso_code
        )
      )
    `)
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error) {
    return null;
  }
  return data;
}

// Order statuses from which provisioning may still be (re)started. An order
// already 'provisioning' or 'delivered' must NOT be claimed again.
const CLAIMABLE_STATUSES = ['pending', 'payment_confirmed', 'provision_failed'];

/**
 * Atomically claim an order for provisioning. Flips its status to
 * 'provisioning' ONLY if it is currently in a claimable state, and returns the
 * order row (with joined plan data) when THIS caller won the claim — or null
 * when another worker already holds it.
 *
 * This is the idempotency gate for eSIM delivery. The Stripe webhook and the
 * checkout success page both call provisionEsim(); without this single-winner
 * claim, one payment could trigger two Celitech purchases. The UPDATE ... WHERE
 * status IN (...) is atomic per row in Postgres, so exactly one caller wins.
 */
export async function claimOrderForProvisioning(
  paymentIntentId: string,
): Promise<OrderRow | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status: 'provisioning', updated_at: new Date().toISOString() })
    .eq('stripe_payment_intent_id', paymentIntentId)
    .in('status', CLAIMABLE_STATUSES)
    .select(`
      *,
      plans (
        wholesale_plan_id,
        name,
        data_gb,
        duration_days,
        destinations (
          name,
          iso_code
        )
      )
    `)
    .maybeSingle();

  if (error) {
    console.error('claimOrderForProvisioning error:', error);
    return null;
  }
  return data;
}

export async function updateOrderStatus(
  paymentIntentId: string,
  status: string,
): Promise<boolean> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('stripe_payment_intent_id', paymentIntentId);

  if (error) {
    console.error('updateOrderStatus error:', error);
    return false;
  }
  return true;
}

/**
 * Attach the buyer's email to an order that does not have one yet.
 *
 * Orders are created in /api/checkout/create-intent before the customer has
 * typed an address, so the column starts empty and — until this runs — the
 * only copy of the address lives in the browser. Writing it at checkout time
 * means provisioning and the delivery-status poller both work off the database
 * instead of depending on the post-payment redirect surviving.
 *
 * Deliberately scoped to blank-email rows: once an address is on file it is
 * the delivery target, and letting a later call overwrite it would turn a
 * leaked payment_intent id into a way to redirect someone else's eSIM.
 */
export async function attachOrderEmail(
  paymentIntentId: string,
  email: string,
): Promise<boolean> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('orders')
    .update({ email, updated_at: new Date().toISOString() })
    .eq('stripe_payment_intent_id', paymentIntentId)
    .eq('email', '');

  if (error) {
    console.error('attachOrderEmail error:', error);
    return false;
  }
  return true;
}

export async function updateOrderProvisionData(
  paymentIntentId: string,
  data: {
    esim_iccid: string;
    esim_qr_encrypted: string;
    esim_activation_code_encrypted: string;
    esim_smdp_address_encrypted: string;
    esim_status: string;
    status: string;
    /**
     * Optional: persist the buyer's email to the order row. The order is
     * originally created with email='' in /api/checkout/create-intent (before
     * the user has typed anything), and the form value never makes it back to
     * the database until now. Without this, dashboard "resend delivery email"
     * lookups by email fail with "Order not found" because the stored email
     * is empty.
     */
    email?: string;
  },
): Promise<boolean> {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from('orders')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('stripe_payment_intent_id', paymentIntentId);

  if (error) {
    console.error('updateOrderProvisionData error:', error);
    return false;
  }
  return true;
}

export async function getOrdersByUser(userId: string): Promise<OrderRow[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      plans (
        wholesale_plan_id,
        name,
        data_gb,
        duration_days,
        destinations (
          name,
          iso_code
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('getOrdersByUser error:', error);
    return [];
  }
  return data || [];
}

// Strip personal identifiers from every order belonging to a user being
// permanently deleted. Order amounts/plans/dates remain intact so the
// 10-year tax-law retention obligation is met (PT Decreto-Lei 28/2019,
// art. 123 CIVA), but the records are no longer linkable to the person.
// Caller MUST pass a service-role-backed Supabase client so this
// bypasses RLS — the anon-key client cannot UPDATE arbitrary user rows.
export async function anonymizeOrdersForUser(
  serviceClient: import('@supabase/supabase-js').SupabaseClient,
  userId: string,
): Promise<number> {
  const { data, error } = await serviceClient
    .from('orders')
    .update({ user_id: null, email: 'deleted@anon.invalid' })
    .eq('user_id', userId)
    .select('id');

  if (error) {
    console.error('anonymizeOrdersForUser error:', error.message);
    throw error;
  }
  return data?.length ?? 0;
}
