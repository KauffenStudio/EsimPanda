import { describe, it, expect } from 'vitest';
import { DEAL_CYCLE_MS, getDealEndsAt, getDealTimeLeft, formatDealTimeLeft } from '../deal-cycle';

const ANCHOR = Date.UTC(2026, 0, 1);

describe('deal cycle', () => {
  it('ends 3 days after the anchor for any moment in the first cycle', () => {
    expect(getDealEndsAt(ANCHOR)).toBe(ANCHOR + DEAL_CYCLE_MS);
    expect(getDealEndsAt(ANCHOR + DEAL_CYCLE_MS - 1)).toBe(ANCHOR + DEAL_CYCLE_MS);
  });

  it('resets to a fresh 3 days the moment a cycle ends', () => {
    const boundary = ANCHOR + 10 * DEAL_CYCLE_MS;
    expect(getDealEndsAt(boundary)).toBe(boundary + DEAL_CYCLE_MS);
    expect(getDealTimeLeft(boundary)).toEqual({ days: 3, hours: 0, minutes: 0, seconds: 0 });
  });

  it('gives every visitor the same deadline', () => {
    const now = Date.UTC(2026, 9, 18, 20, 15, 0);
    expect(getDealEndsAt(now)).toBe(getDealEndsAt(now + 60_000));
  });

  it('formats as "2d 14:05:09", dropping days on the last day', () => {
    expect(formatDealTimeLeft({ days: 2, hours: 14, minutes: 5, seconds: 9 })).toBe('2d 14:05:09');
    expect(formatDealTimeLeft({ days: 0, hours: 3, minutes: 0, seconds: 1 })).toBe('03:00:01');
  });
});
