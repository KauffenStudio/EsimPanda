export const MOCK_USER = {
  id: 'mock-user-id',
  email: 'test@esimpanda.com',
  created_at: new Date().toISOString(),
  user_metadata: {},
};

export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_STRIPE_MOCK === 'true';
}
