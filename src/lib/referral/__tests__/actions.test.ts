import { describe, it, expect } from 'vitest';
import { generateReferralCode, trackReferralClick, checkAndFulfillReward, getReferralData } from '../actions';

describe('generateReferralCode', () => {
  it('generates a 6-character uppercase alphanumeric code', async () => {
    const result = await generateReferralCode('user-1', 'user1@test.com');
    expect(result.code).toMatch(/^[A-Z0-9]{6}$/);
    expect(result.user_id).toBe('user-1');
    expect(result.user_email).toBe('user1@test.com');
  });

  it('returns existing code if user already has one', async () => {
    const first = await generateReferralCode('user-2', 'user2@test.com');
    const second = await generateReferralCode('user-2', 'user2@test.com');
    expect(first.code).toBe(second.code);
  });
});

describe('checkAndFulfillReward', () => {
  it('blocks self-referral when emails match', async () => {
    const code = await generateReferralCode('user-3', 'same@test.com');
    const result = await checkAndFulfillReward(code.code, 'same@test.com');
    expect(result.rewarded).toBe(false);
    expect(result.reason).toBe('self_referral');
  });

  it('enforces monthly cap of 5', async () => {
    const code = await generateReferralCode('user-4', 'referrer@test.com');
    // Fulfill 5 rewards
    for (let i = 0; i < 5; i++) {
      await checkAndFulfillReward(code.code, `friend${i}@test.com`);
    }
    // 6th should be capped
    const result = await checkAndFulfillReward(code.code, 'friend99@test.com');
    expect(result.rewarded).toBe(false);
    expect(result.reason).toBe('monthly_cap_exceeded');
  });

  it('generates 100% off single-use reward coupon', async () => {
    const code = await generateReferralCode('user-5', 'ref5@test.com');
    const result = await checkAndFulfillReward(code.code, 'buyer5@test.com');
    expect(result.rewarded).toBe(true);
    // Verify reward was created
    const data = await getReferralData('user-5');
    expect(data.rewards.length).toBeGreaterThan(0);
    expect(data.rewards[0].coupon_code).toMatch(/^REF-[A-Z0-9]{8}$/);
    expect(data.rewards[0].redeemed).toBe(false);
  });
});

describe('trackReferralClick', () => {
  it('returns true for valid code', async () => {
    const code = await generateReferralCode('user-6', 'user6@test.com');
    const result = await trackReferralClick(code.code);
    expect(result).toBe(true);
  });

  it('returns false for invalid code', async () => {
    const result = await trackReferralClick('INVALID');
    expect(result).toBe(false);
  });
});
