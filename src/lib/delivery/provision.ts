import { encrypt, decrypt } from './encryption';
import { mockProvision } from '@/lib/mock-data/delivery';
import { createProvider } from '@/lib/esim/provider';
import { toWholesaleIso } from '@/lib/esim/destination-iso';
import { sendDeliveryEmail } from '@/lib/email/send-delivery';
import { sendDeliveryFailureAlert } from '@/lib/email/send-admin-alert';
import { sendOutOfStockEmail } from '@/lib/email/send-out-of-stock';
import { refundChargeForOutOfStock } from './refund';
import { IS_MOCK } from '@/lib/config/mode';
import {
  getOrderByPaymentIntent,
  claimOrderForProvisioning,
  updateOrderProvisionData,
  updateOrderStatus,
} from '@/lib/db/orders';
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
  if (
    existing &&
    (existing.status === 'ready' ||
      existing.status === 'failed' ||
      existing.status === 'out_of_stock')
  ) {
    return existing;
  }

  const orderId = generateOrderId(paymentIntentId);

  // Mark as provisioning
  const inProgress: ProvisionResult = { status: 'provisioning', order_id: orderId };
  provisioningState.set(paymentIntentId, inProgress);

  // Look up order from DB for real plan data
  let orderData: {
    wholesalePlanId: string;
    planName: string;
    destination: string;
    destinationIso: string;
    dataGb: string;
    durationDays: string;
    orderEmail: string;
    amountPaid: string;
  } | null = null;

  if (!IS_MOCK) {
    try {
      const order = await getOrderByPaymentIntent(paymentIntentId);

      // Idempotency 1 — already delivered: return the existing eSIM. Never
      // start a second Celitech purchase for a payment that was already
      // fulfilled (e.g. the success page polls after the webhook finished).
      if (
        order &&
        order.status === 'delivered' &&
        order.esim_iccid &&
        order.esim_qr_encrypted
      ) {
        const qrData = JSON.parse(decrypt(order.esim_qr_encrypted));
        const done: ProvisionResult = {
          status: 'ready',
          order_id: orderId,
          encrypted_payload: order.esim_qr_encrypted,
          data: {
            iccid: order.esim_iccid,
            activation_qr_base64: qrData.qr_base64 ?? '',
            manual_activation_code: qrData.activation_code ?? '',
            smdp_address: qrData.smdp_address ?? '',
          },
        };
        provisioningState.set(paymentIntentId, done);
        return done;
      }

      // Idempotency 1b — already refunded for out-of-stock: surface that status
      // so the polling success page renders the apology screen, not a stuck
      // spinner. Without this the late caller would fall through and either
      // attempt provisioning again or get parked in `provisioning` forever.
      if (order && order.status === 'refunded_out_of_stock') {
        const result: ProvisionResult = {
          status: 'out_of_stock',
          order_id: orderId,
          error: 'This destination was temporarily out of stock. Your payment has been refunded.',
        };
        provisioningState.set(paymentIntentId, result);
        return result;
      }

      // Idempotency 2 — atomic single-winner claim. The Stripe webhook and the
      // checkout success page both call this function; only the caller that
      // wins the claim runs the Celitech purchase. A loser bails out here so
      // the customer is never charged once but provisioned twice.
      const claimed = await claimOrderForProvisioning(paymentIntentId);
      if (!claimed) {
        // Another worker owns provisioning. Drop this instance's stale
        // in-memory entry so the status route falls through to the DB, which
        // the winning worker updates to 'delivered'.
        provisioningState.delete(paymentIntentId);
        return { status: 'provisioning', order_id: orderId };
      }

      if (claimed.plans) {
        orderData = {
          wholesalePlanId: claimed.plans.wholesale_plan_id,
          planName: claimed.plans.name,
          destination: claimed.plans.destinations?.name || 'Unknown',
          destinationIso: claimed.plans.destinations?.iso_code || '',
          dataGb: String(claimed.plans.data_gb),
          durationDays: String(claimed.plans.duration_days),
          orderEmail: claimed.email,
          amountPaid: (claimed.amount_paid_cents / 100).toFixed(2),
        };
        email = email || claimed.email;
      }
    } catch (err) {
      console.error('Order lookup/claim failed, continuing with provisioning:', err);
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
        if (!orderData?.destinationIso || !orderData.dataGb || !orderData.durationDays) {
          throw new Error('Missing plan data needed for Celitech purchase (destinationIso/dataGb/durationDays)');
        }
        const provider = createProvider();
        purchase = await provider.purchase({
          // Translate our curated synthetic regional ISOs (EUW/ASW/GLW) back
          // to Celitech's identifiers (EUROPE/ASIA/GLOBAL). Country ISOs pass
          // through unchanged. Without this, regional purchases would 404 on
          // Celitech because they only know our DB-internal codes via the
          // sync.
          destination: toWholesaleIso(orderData.destinationIso),
          dataLimitInGb: Number(orderData.dataGb),
          durationDays: Number(orderData.durationDays),
          email: orderData.orderEmail,
          referenceId: orderId,
        });
      }

      // Diagnostic: log exactly what Celitech (or mock) returned so we can
      // tell, from production logs, whether the provider returned a real eSIM
      // or an empty profile (which is the symptom that produces an empty QR
      // code on screen and silently bypasses real delivery).
      console.log('[provision] purchase returned', {
        attempt,
        iccidLength: purchase.iccid?.length ?? 0,
        manualActivationCodeLength: purchase.manualActivationCode?.length ?? 0,
        hasIosLink: !!purchase.iosActivationLink,
        hasAndroidLink: !!purchase.androidActivationLink,
      });

      // Safeguard: Celitech can return a "successful" response with a missing
      // profile object — the adapter then surfaces all-empty fields. Marking
      // such an order as `delivered` is worse than failing, because the
      // frontend serves a useless QR code (LPA:1$$) and the email goes out
      // with empty manual-setup codes. Treat empty iccid as a hard failure so
      // the retry loop runs again and the customer ultimately sees the proper
      // error UI instead of a broken-looking success state.
      if (!IS_MOCK && (!purchase.iccid || !purchase.manualActivationCode)) {
        throw new Error(
          `Celitech returned empty profile (iccid=${purchase.iccid?.length ?? 0}, ` +
            `manualActivationCode=${purchase.manualActivationCode?.length ?? 0}). ` +
            `Most likely cause: sandbox credentials, or destination/duration/data combo ` +
            `not matching any package on the Celitech side.`,
        );
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
            // Backfill the email if the stored value is empty. /create-intent
            // creates the order before the user has typed an address, so the
            // column is '' until we get here. /api/delivery/email-credentials
            // (the "Email me these details" button on the success page) looks
            // up by stored email, so without this update that endpoint
            // rejects every request with "Order not found".
            ...(email && !orderData?.orderEmail ? { email } : {}),
          });
        } catch (dbErr) {
          console.error('DB update failed after provisioning:', dbErr);
        }
      }

      // Send delivery email with real data
      console.log('[provision] before email gate', {
        emailPresent: !!email,
        emailLength: email?.length ?? 0,
      });
      if (email) {
        const destination = orderData?.destination || 'Your destination';
        let failureReason: string | null = null;
        try {
          console.log('[provision] calling sendDeliveryEmail', { to: email });
          const sendResult = await sendDeliveryEmail({
            to: email,
            orderId,
            planName: orderData?.planName || 'eSIM Data Plan',
            destination,
            dataGb: orderData?.dataGb || '-',
            durationDays: orderData?.durationDays || '-',
            smdpAddress: deliveryData.smdp_address,
            activationCode: deliveryData.manual_activation_code,
            iosLink: deliveryData.ios_activation_link,
            androidLink: deliveryData.android_activation_link,
            amountPaid: orderData?.amountPaid || '-',
            currency: 'USD',
          });
          console.log('[provision] sendDeliveryEmail returned', sendResult);
          if (!sendResult.ok) {
            failureReason = sendResult.error;
          }
        } catch (emailError) {
          const msg = emailError instanceof Error ? emailError.message : String(emailError);
          console.error('[provision] Failed to send delivery email:', emailError);
          failureReason = `unhandled: ${msg}`;
        }

        // Fire-and-forget admin alert when the customer email fails. We do not
        // await this — provision should not block on a courtesy notification.
        if (failureReason) {
          void sendDeliveryFailureAlert({
            orderId,
            paymentIntentId,
            customerEmail: email,
            destination,
            failureReason,
          });
        }
      } else {
        console.warn('[provision] skipping email send — no email available');
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Out-of-stock from Celitech is non-transient — retrying won't summon
      // new profiles. Bail out, refund the customer, notify both sides, and
      // surface a distinct status so the UI can show an apology instead of a
      // generic provisioning error.
      if (isCelitechOutOfStock(lastError)) {
        return await handleOutOfStock({
          paymentIntentId,
          orderId,
          customerEmail: email,
          destination: orderData?.destination,
          amount: orderData?.amountPaid,
        });
      }

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

/**
 * Celitech surfaces "out of stock" as a thrown error with this exact string in
 * the message. Other Celitech errors (auth, network, bad params) must NOT
 * match — those are transient and should still go through the retry loop.
 */
function isCelitechOutOfStock(err: Error): boolean {
  return /not enough available profiles/i.test(err.message);
}

/**
 * Run when Celitech is sold out for the destination the customer paid for:
 * refund the Stripe charge (idempotent), email the customer an apology, fire
 * an admin alert so we know to top up Celitech, and surface a distinct
 * `out_of_stock` status to the frontend.
 */
async function handleOutOfStock(args: {
  paymentIntentId: string;
  orderId: string;
  customerEmail?: string;
  destination?: string;
  amount?: string;
}): Promise<ProvisionResult> {
  const { paymentIntentId, orderId, customerEmail, destination, amount } = args;
  const destLabel = destination || 'your destination';

  console.warn('[provision] Celitech out-of-stock', { paymentIntentId, orderId, destination });

  let refundId: string | undefined;
  if (!IS_MOCK) {
    const refund = await refundChargeForOutOfStock(paymentIntentId);
    if (refund.ok) {
      refundId = refund.refundId;
      console.log('[provision] refund succeeded', { refundId });
    } else {
      console.error('[provision] refund FAILED', { error: refund.error });
    }
    await updateOrderStatus(paymentIntentId, 'refunded_out_of_stock').catch((err) => {
      console.error('[provision] failed to mark order refunded_out_of_stock:', err);
    });
  }

  if (customerEmail) {
    void sendOutOfStockEmail({
      to: customerEmail,
      destination: destLabel,
      orderId,
      amount: amount || '-',
      currency: 'USD',
      refundId,
    });
  }

  void sendDeliveryFailureAlert({
    orderId,
    paymentIntentId,
    customerEmail: customerEmail || '<empty>',
    destination: destLabel,
    failureReason: `out_of_stock — Celitech has no profiles for ${destLabel}. Refund ${refundId ? `succeeded (${refundId})` : 'FAILED — manual refund needed'}.`,
  });

  const result: ProvisionResult = {
    status: 'out_of_stock',
    order_id: orderId,
    error: `${destLabel} is temporarily out of stock. Your payment has been refunded.`,
  };
  provisioningState.set(paymentIntentId, result);
  return result;
}
