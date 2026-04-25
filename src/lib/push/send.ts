import webpush from 'web-push';
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } from './vapid';

// Configure VAPID
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  type: 'expiry' | 'usage' | 'promo';
  actions: Array<{ action: string; title: string }>;
}

export async function sendPush(subscription: PushSubscriptionJSON, payload: PushPayload) {
  const isMock = process.env.NEXT_PUBLIC_PUSH_MOCK === 'true';
  if (isMock) {
    console.log('[PUSH MOCK] Would send:', payload);
    return { success: true, mock: true };
  }
  await webpush.sendNotification(subscription as webpush.PushSubscription, JSON.stringify(payload));
  return { success: true };
}
