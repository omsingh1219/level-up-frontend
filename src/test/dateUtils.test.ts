import { describe, it, expect } from 'vitest';
import {
  calculateExpiryDate,
  calculateDaysRemaining,
  getMembershipStatusFromDates,
  generateExpiryIdempotencyKey,
  formatReadableDate,
  formatReadableDateTime
} from '../utils/dateUtils';
import { format, addDays, subDays, startOfToday } from 'date-fns';

describe('Date & Expiry Utilities', () => {
  it('correctly calculates expiry date from start date and duration', () => {
    expect(calculateExpiryDate('2026-01-01', 30)).toBe('2026-01-31');
    expect(calculateExpiryDate('2026-01-01', 90)).toBe('2026-04-01');
    expect(calculateExpiryDate('2026-01-01', 365)).toBe('2027-01-01');
  });

  it('handles leap years accurately (e.g. Feb 2028 has 29 days)', () => {
    // 2028 is a leap year. Feb 1 + 28 days = Feb 29
    expect(calculateExpiryDate('2028-02-01', 28)).toBe('2028-02-29');
    // Feb 1 + 29 days = March 1
    expect(calculateExpiryDate('2028-02-01', 29)).toBe('2028-03-01');
  });

  it('correctly computes days remaining relative to today', () => {
    const todayStr = format(startOfToday(), 'yyyy-MM-dd');
    const future7Str = format(addDays(startOfToday(), 7), 'yyyy-MM-dd');
    const past1Str = format(subDays(startOfToday(), 1), 'yyyy-MM-dd'); // Expired yesterday
    const past14Str = format(subDays(startOfToday(), 14), 'yyyy-MM-dd');

    expect(calculateDaysRemaining(todayStr)).toBe(0);
    expect(calculateDaysRemaining(future7Str)).toBe(7);
    expect(calculateDaysRemaining(past1Str)).toBe(-1); // Expired yesterday
    expect(calculateDaysRemaining(past14Str)).toBe(-14);
  });

  it('accurately resolves membership status enum across thresholds', () => {
    const future30 = format(addDays(startOfToday(), 30), 'yyyy-MM-dd');
    const future7 = format(addDays(startOfToday(), 7), 'yyyy-MM-dd');
    const future1 = format(addDays(startOfToday(), 1), 'yyyy-MM-dd');
    const today = format(startOfToday(), 'yyyy-MM-dd');
    const yesterday = format(subDays(startOfToday(), 1), 'yyyy-MM-dd');

    expect(getMembershipStatusFromDates(future30)).toBe('ACTIVE');
    expect(getMembershipStatusFromDates(future7)).toBe('EXPIRING_SOON');
    expect(getMembershipStatusFromDates(future1)).toBe('EXPIRING_SOON');
    expect(getMembershipStatusFromDates(today)).toBe('EXPIRING_SOON');
    expect(getMembershipStatusFromDates(yesterday)).toBe('EXPIRED');
  });

  it('generates consistent, deterministic idempotency keys to prevent duplicate reminders', () => {
    const key1 = generateExpiryIdempotencyKey('gym-123', 'mem-456', 7, '2026-12-31');
    const key2 = generateExpiryIdempotencyKey('gym-123', 'mem-456', 7, '2026-12-31');
    const keyDiffDay = generateExpiryIdempotencyKey('gym-123', 'mem-456', 3, '2026-12-31');

    expect(key1).toBe('expiry-reminder_gym-123_mem-456_d7_2026-12-31');
    expect(key1).toBe(key2);
    expect(key1).not.toBe(keyDiffDay);
  });

  it('formats dates cleanly and safely handles invalid values', () => {
    expect(formatReadableDate('2026-10-15')).toBe('15 Oct 2026');
    expect(formatReadableDate(undefined)).toBe('N/A');
    expect(formatReadableDate('invalid-date')).toBe('N/A');
  });
});
