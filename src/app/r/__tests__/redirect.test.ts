import { describe, it, expect } from 'vitest';
import { GET } from '../[code]/route';

describe('Referral redirect', () => {
  it('redirects to /en and sets ref cookie with 7-day expiry', async () => {
    const request = new Request('https://esimpanda.com/r/ABC123');
    const response = await GET(request, { params: Promise.resolve({ code: 'ABC123' }) });

    expect(response.status).toBe(307); // redirect
    const cookie = response.headers.get('set-cookie');
    expect(cookie).toContain('ref=ABC123');
    expect(cookie).toContain('Max-Age=604800'); // 7 * 24 * 60 * 60
    expect(cookie).toContain('HttpOnly');
    expect(cookie?.toLowerCase()).toContain('samesite=lax');
  });
});
