import { encrypt } from './encryption';
import { mockProvision } from '@/lib/mock-data/delivery';
import { createProvider } from '@/lib/esim/provider';
import type { ProvisionResult, DeliveryData } from './types';
import type { NormalizedPurchase } from '@/lib/esim/types';

const isMockMode = () => process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true';

/**
 * In-memory provisioning state, keyed by payment_intent_id.
 * In production this would be DB reads, but for Phase 4 dev
 * with no Supabase connection we use in-memory state.
 */
export const provisioningState = new Map<string, ProvisionResult>();

/**
 * Extracts SMDP address from activation code format LPA:1$smdp$code
 * Falls back to empty string if format doesn't match.
 */
function extractSmdpAddress(activationCode: string): string {
  const match = activationCode.match(/LPA:1\$([^$]+)\$/);
  return match?.[1] ?? '';
}

/**
 * Builds DeliveryData from a NormalizedPurchase response.
 */
function buildDeliveryData(purchase: NormalizedPurchase): DeliveryData {
  const smdpAddress = extractSmdpAddress(purchase.manualActivationCode);

  // Encrypt sensitive activation data
  encrypt(
    JSON.stringify({
      activation_code: purchase.manualActivationCode,
      smdp_address: smdpAddress,
      qr_base64: purchase.activationQrBase64,
    })
  );

  return {
    iccid: purchase.iccid,
    activation_qr_base64: purchase.activationQrBase64,
    manual_activation_code: purchase.manualActivationCode,
    smdp_address: smdpAddress,
    ios_activation_link: purchase.iosActivationLink,
    android_activation_link: purchase.androidActivationLink,
  };
}

/**
 * Generates a deterministic order ID from payment intent ID.
 */
function generateOrderId(paymentIntentId: string): string {
  return 'ORD-' + paymentIntentId.slice(-8).toUpperCase();
}

/**
 * Core idempotent provisioning function.
 * - If already provisioned for this payment_intent, returns cached result.
 * - In mock mode, uses simulated 3-5s delay.
 * - In real mode, calls the ESIMProvider.purchase().
 * - Retries up to 3 times on failure.
 */
export async function provisionEsim(paymentIntentId: string): Promise<ProvisionResult> {
  // Idempotency check: if already provisioned or delivered, return existing
  const existing = provisioningState.get(paymentIntentId);
  if (existing && (existing.status === 'ready' || existing.status === 'failed')) {
    return existing;
  }

  const orderId = generateOrderId(paymentIntentId);

  // Mark as provisioning
  const inProgress: ProvisionResult = { status: 'provisioning', order_id: orderId };
  provisioningState.set(paymentIntentId, inProgress);

  let lastError: Error | null = null;
  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      let purchase: NormalizedPurchase;

      if (isMockMode()) {
        purchase = await mockProvision();
      } else {
        // Real mode: call wholesale provider
        // In production, wholesalePlanId comes from order lookup in DB
        const provider = createProvider();
        purchase = await provider.purchase('placeholder-plan-id', 1);
      }

      const deliveryData = buildDeliveryData(purchase);

      const result: ProvisionResult = {
        status: 'ready',
        data: deliveryData,
        order_id: orderId,
      };

      provisioningState.set(paymentIntentId, result);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      // Wait 2s before retry (skip wait on last attempt)
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  // All retries failed
  const failedResult: ProvisionResult = {
    status: 'failed',
    order_id: orderId,
    error: lastError?.message ?? 'Provisioning failed after retries',
    retry_count: MAX_RETRIES,
  };

  provisioningState.set(paymentIntentId, failedResult);
  return failedResult;
}
