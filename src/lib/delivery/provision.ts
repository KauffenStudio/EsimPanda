import { encrypt } from './encryption';
import { mockProvision } from '@/lib/mock-data/delivery';
import { createProvider } from '@/lib/esim/provider';
import { sendDeliveryEmail } from '@/lib/email/send-delivery';
import { IS_MOCK } from '@/lib/config/mode';
import { getOrderByPaymentIntent, updateOrderProvisionData, updateOrderStatus } from '@/lib/db/orders';
import type { ProvisionResult, DeliveryData } from './types';
import type { NormalizedPurchase } from '@/lib/esim/types';

/**
 * In-memory provisioning state, keyed by payment_intent_id.
 * Used as fast cache; DB is source of truth in production.
 */
export const provisioningState = new Map<string, ProvisionResult>();

function extractSmdpAddress(activationCode: string): string {
  const match = activationCode.match(/LPA:1\$([^$]+)\$/);
  return match?.[1] ?? '';
}

function buildDeliveryData(purchase: NormalizedPurchase): DeliveryData & { encrypted_payload: string } {
  const smdpAddress = extractSmdpAddress(purchase.manualActivationCode);

  const encrypted_payload = encrypt(
    JSON.stringify({
      activation_code: purchase.manualActivationCode,
      smdp_address: smdpAddress,
      qr_base64: purchase.activationQrBase64,
    }),
  );

  return {
    iccid: purchase.iccid,
    activation_qr_base64: purchase.activationQrBase64,
    manual_activation_code: purchase.manualActivationCode,
    smdp_address: smdpAddress,
    ios_activation_link: purchase.iosActivationLink,
    android_activation_link: purchase.androidActivationLink,
    encrypted_payload,
  };
}

function generateOrderId(paymentIntentId: string): string {
  return 'ORD-' + paymentIntentId.slice(-8).toUpperCase();
}

export async function provisionEsim(paymentIntentId: string, email?: string): Promise<ProvisionResult> {
  // Idempotency: return cached result
  const existing = provisioningState.get(paymentIntentId);
  if (existing && (existing.status === 'ready' || existing.status === 'failed')) {
    return existing;
  }

  const orderId = generateOrderId(paymentIntentId);

  // Mark as provisioning
  const inProgress: ProvisionResult = { status: 'provisioning', order_id: orderId };
  provisioningState.set(paymentIntentId, inProgress);

  // Look up order from DB for real plan data
  let orderData: { wholesalePlanId: string; planName: string; destination: string; dataGb: string; durationDays: string; orderEmail: string; amountPaid: string } | null = null;

  if (!IS_MOCK) {
    try {
      const order = await getOrderByPaymentIntent(paymentIntentId);
      if (order?.plans) {
        orderData = {
          wholesalePlanId: order.plans.wholesale_plan_id,
          planName: order.plans.name,
          destination: order.plans.destinations?.name || 'Unknown',
          dataGb: String(order.plans.data_gb),
          durationDays: String(order.plans.duration_days),
          orderEmail: order.email,
          amountPaid: (order.amount_paid_cents / 100).toFixed(2),
        };
        email = email || order.email;
        await updateOrderStatus(paymentIntentId, 'provisioning');
      }
    } catch (err) {
      console.error('Order lookup failed, continuing with provisioning:', err);
    }
  }

  let lastError: Error | null = null;
  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      let purchase: NormalizedPurchase;

      if (IS_MOCK) {
        purchase = await mockProvision();
      } else {
        const provider = createProvider();
        const planId = orderData?.wholesalePlanId || 'placeholder-plan-id';
        purchase = await provider.purchase(planId, 1);
      }

      const { encrypted_payload, ...deliveryData } = buildDeliveryData(purchase);

      const result: ProvisionResult = {
        status: 'ready',
        data: deliveryData,
        order_id: orderId,
        encrypted_payload,
      };

      provisioningState.set(paymentIntentId, result);

      // Persist to DB
      if (!IS_MOCK) {
        try {
          await updateOrderProvisionData(paymentIntentId, {
            esim_iccid: purchase.iccid,
            esim_qr_encrypted: encrypted_payload,
            esim_activation_code_encrypted: encrypt(purchase.manualActivationCode),
            esim_smdp_address_encrypted: encrypt(deliveryData.smdp_address),
            esim_status: 'provisioned',
            status: 'delivered',
          });
        } catch (dbErr) {
          console.error('DB update failed after provisioning:', dbErr);
        }
      }

      // Send delivery email with real data
      if (email) {
        try {
          await sendDeliveryEmail({
            to: email,
            orderId,
            planName: orderData?.planName || 'eSIM Data Plan',
            destination: orderData?.destination || 'Your destination',
            dataGb: orderData?.dataGb || '-',
            durationDays: orderData?.durationDays || '-',
            smdpAddress: deliveryData.smdp_address,
            activationCode: deliveryData.manual_activation_code,
            iosLink: deliveryData.ios_activation_link,
            androidLink: deliveryData.android_activation_link,
            amountPaid: orderData?.amountPaid || '-',
            currency: 'USD',
          });
        } catch (emailError) {
          console.error('Failed to send delivery email:', emailError);
        }
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
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

  if (!IS_MOCK) {
    await updateOrderStatus(paymentIntentId, 'provision_failed').catch(() => {});
  }

  return failedResult;
}
