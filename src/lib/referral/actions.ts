import { customAlphabet } from 'nanoid';
import type { ReferralCode, ReferralReward, ReferralStats } from './types';
import {
  getMockReferralCode,
  setMockReferralCode,
  findMockReferralCodeByCode,
  getMockReferralStats,
  getMockRewards,
  addMockReward,
} from './mock';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);
const nanoid8 = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

export async function generateReferralCode(
  userId: string,
  userEmail: string,
): Promise<ReferralCode> {
  // Check if user already has a code
  const existing = getMockReferralCode(userId);
  if (existing) return existing;

  const code: ReferralCode = {
    code: nanoid(),
    user_id: userId,
    user_email: userEmail,
    created_at: new Date().toISOString(),
  };

  setMockReferralCode(userId, code);
  return code;
}

export async function trackReferralClick(code: string): Promise<boolean> {
  const found = findMockReferralCodeByCode(code);
  if (!found) return false;

  // Record click (in-memory, no persistence needed for mock)
  return true;
}

export async function checkAndFulfillReward(
  referrerCode: string,
  buyerEmail: string,
): Promise<{ rewarded: boolean; reason?: string }> {
  // Look up referrer by code
  const referrer = findMockReferralCodeByCode(referrerCode);
  if (!referrer) {
    return { rewarded: false, reason: 'invalid_code' };
  }

  // Self-referral check
  if (referrer.user_email === buyerEmail) {
    return { rewarded: false, reason: 'self_referral' };
  }

  // Monthly cap check
  const rewards = getMockRewards(referrer.user_id);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlyRewards = rewards.filter((r) => {
    const earned = new Date(r.earned_at);
    return earned.getMonth() === currentMonth && earned.getFullYear() === currentYear;
  });

  if (monthlyRewards.length >= 5) {
    return { rewarded: false, reason: 'monthly_cap_exceeded' };
  }

  // Generate reward coupon
  const reward: ReferralReward = {
    id: nanoid8(),
    referrer_user_id: referrer.user_id,
    referred_email: buyerEmail,
    coupon_code: `REF-${nanoid8()}`,
    redeemed: false,
    earned_at: new Date().toISOString(),
  };

  addMockReward(referrer.user_id, reward);
  return { rewarded: true };
}

export async function getReferralData(userId: string): Promise<{
  code: ReferralCode | null;
  stats: ReferralStats;
  rewards: ReferralReward[];
}> {
  const code = getMockReferralCode(userId) || null;
  const stats = getMockReferralStats(userId);
  const rewards = getMockRewards(userId);

  return { code, stats, rewards };
}
