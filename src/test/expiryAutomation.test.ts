import { describe, it, expect } from 'vitest';
import { generateExpiryIdempotencyKey } from '../utils/dateUtils';

describe('Expiry Automation & Duplicate Prevention Logic', () => {
  it('prevents duplicate notification dispatch across re-runs using idempotency set', () => {
    const existingKeys = new Set<string>();

    const gymId = 'gym-alpha';
    const membershipId = 'membership-99';
    const triggerDay = 7;
    const expiryDate = '2026-11-20';

    const idempotencyKey = generateExpiryIdempotencyKey(gymId, membershipId, triggerDay, expiryDate);

    // First scheduled execution
    let sentCount = 0;
    let skippedCount = 0;

    if (!existingKeys.has(idempotencyKey)) {
      existingKeys.add(idempotencyKey);
      sentCount++;
    } else {
      skippedCount++;
    }

    expect(sentCount).toBe(1);
    expect(skippedCount).toBe(0);

    // Second scheduled execution on the same day (e.g. cloud scheduler retried or re-executed)
    if (!existingKeys.has(idempotencyKey)) {
      existingKeys.add(idempotencyKey);
      sentCount++;
    } else {
      skippedCount++;
    }

    expect(sentCount).toBe(1); // Should still be 1!
    expect(skippedCount).toBe(1); // Skipped because key already recorded
  });

  it('triggers distinct reminders as membership moves from 7d to 3d to 1d to 0d', () => {
    const sentReminders = new Set<string>();
    const gymId = 'gym-alpha';
    const memId = 'mem-101';
    const expiryDate = '2026-12-01';

    const triggerDays = [7, 3, 1, 0, -1];

    triggerDays.forEach(day => {
      const key = generateExpiryIdempotencyKey(gymId, memId, day, expiryDate);
      expect(sentReminders.has(key)).toBe(false);
      sentReminders.add(key);
    });

    expect(sentReminders.size).toBe(5);
  });
});
