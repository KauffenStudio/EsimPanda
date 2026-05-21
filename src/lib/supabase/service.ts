import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. Bypasses RLS — use ONLY in trusted server
 * contexts (API routes, webhooks, server actions), never in code reachable
 * from the browser.
 *
 * Order writes happen during checkout for guest (logged-out) buyers, so the
 * anon/cookie client cannot satisfy the `orders` table RLS policy. These
 * inserts/updates run server-side after Stripe has been called, so a
 * service-role client is the correct tool.
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
