import {
  format,
  parseISO,
  addDays,
  differenceInCalendarDays,
  startOfToday,
  isBefore,
  isAfter,
  isValid
} from 'date-fns';
import type { MembershipStatus } from '@/types';

/**
 * Calculates the expiry date string (YYYY-MM-DD) from a start date and duration in days.
 */
export function calculateExpiryDate(startDateIso: string, durationInDays: number): string {
  const parsed = parseISO(startDateIso);
  if (!isValid(parsed)) {
    throw new Error(`Invalid start date: ${startDateIso}`);
  }
  const expiry = addDays(parsed, durationInDays);
  return format(expiry, 'yyyy-MM-dd');
}

/**
 * Computes calendar days remaining until expiry from today.
 * Positive number = days until expiry.
 * 0 = expires today.
 * Negative number = already expired by N days.
 */
export function calculateDaysRemaining(expiryDateIso: string): number {
  const parsed = parseISO(expiryDateIso);
  if (!isValid(parsed)) return 0;
  return differenceInCalendarDays(parsed, startOfToday());
}

/**
 * Determines current status from expiry date
 */
export function getMembershipStatusFromDates(expiryDateIso: string): MembershipStatus {
  const days = calculateDaysRemaining(expiryDateIso);
  if (days < 0) return 'EXPIRED';
  if (days <= 7) return 'EXPIRING_SOON';
  return 'ACTIVE';
}

/**
 * Formats ISO date to human readable e.g. "15 Oct 2026"
 */
export function formatReadableDate(dateIso: string | undefined): string {
  if (!dateIso) return 'N/A';
  try {
    const parsed = typeof dateIso === 'string' ? parseISO(dateIso) : new Date(dateIso);
    if (!isValid(parsed)) return 'N/A';
    return format(parsed, 'dd MMM yyyy');
  } catch {
    return 'N/A';
  }
}

/**
 * Formats ISO date with time e.g. "15 Oct 2026, 04:30 PM"
 */
export function formatReadableDateTime(dateIso: string | undefined): string {
  if (!dateIso) return 'N/A';
  try {
    const parsed = typeof dateIso === 'string' ? parseISO(dateIso) : new Date(dateIso);
    if (!isValid(parsed)) return 'N/A';
    return format(parsed, 'dd MMM yyyy, hh:mm a');
  } catch {
    return 'N/A';
  }
}

/**
 * Deterministic idempotency key generator for membership expiry reminders
 */
export function generateExpiryIdempotencyKey(
  gymId: string,
  membershipId: string,
  triggerDay: number,
  expiryDate: string
): string {
  return `expiry-reminder_${gymId}_${membershipId}_d${triggerDay}_${expiryDate}`;
}
