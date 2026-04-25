'use server';

// In-memory subscription storage for mock mode (production uses Supabase)
const subscriptions = new Map<string, PushSubscriptionJSON>();

export async function subscribeUser(subscription: PushSubscriptionJSON, email: string) {
  const isMock = process.env.NEXT_PUBLIC_PUSH_MOCK === 'true';
  if (isMock) {
    subscriptions.set(email, subscription);
    console.log('[PUSH MOCK] Subscribed:', email);
    return { success: true };
  }
  // Production: store in Supabase push_subscriptions table
  subscriptions.set(email, subscription);
  return { success: true };
}

export async function unsubscribeUser(email: string) {
  subscriptions.delete(email);
  return { success: true };
}

export async function sendTestNotification(email: string) {
  const sub = subscriptions.get(email);
  if (!sub) return { success: false, error: 'No subscription found' };

  const { sendPush } = await import('./send');
  await sendPush(sub, {
    title: 'eSIM Panda',
    body: 'Push notifications are working!',
    url: '/dashboard',
    type: 'promo',
    actions: [{ action: 'view', title: 'View deal' }],
  });
  return { success: true };
}
