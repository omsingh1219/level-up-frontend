import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Membership, Member, AutomationSettings } from '@/types';
import {
  calculateDaysRemaining,
  getMembershipStatusFromDates,
  generateExpiryIdempotencyKey
} from '@/utils/dateUtils';
import { createNotification } from './notificationService';
import { sendWhatsAppExpiryReminder } from './whatsappService';
import { sendEmailReminder } from './emailService';
import { logAuditEvent } from './auditService';

export interface ExpiryAutomationRunResult {
  gymId: string;
  scannedCount: number;
  remindersSent: number;
  duplicateSkipped: number;
  expiredUpdated: number;
  errors: string[];
}

/**
 * Runs the deterministic expiry processing pipeline for a gym.
 * Can be invoked by Cloud Functions daily cron OR on-demand by Admin in dashboard.
 */
export async function runExpiryAutomationForGym(gymId: string): Promise<ExpiryAutomationRunResult> {
  const result: ExpiryAutomationRunResult = {
    gymId,
    scannedCount: 0,
    remindersSent: 0,
    duplicateSkipped: 0,
    expiredUpdated: 0,
    errors: [],
  };

  try {
    // 1. Fetch gym automation settings
    const settingsSnap = await getDoc(doc(db, 'gyms', gymId, 'automationSettings', 'config'));
    const gymSnap = await getDoc(doc(db, 'gyms', gymId));
    const gymName = gymSnap.exists() ? gymSnap.data().name : 'GymOS';

    let settings: AutomationSettings = {
      reminderDaysBefore: [7, 3, 1, 0],
      notifyOnExpired: true,
      sendWhatsAppReminders: true,
      sendEmailReminders: true,
      sendInAppReminders: true,
      whatsappConfig: { phoneNumberId: '', businessAccountId: '', status: 'UNCONFIGURED' },
      emailConfig: { provider: 'NONE', fromEmail: '', replyToEmail: '', status: 'UNCONFIGURED' },
      updatedAt: new Date().toISOString(),
    };

    if (settingsSnap.exists()) {
      settings = { ...settings, ...settingsSnap.data() as AutomationSettings };
    }

    // 2. Fetch all memberships
    const membershipsCol = collection(db, 'gyms', gymId, 'memberships');
    const snapshot = await getDocs(membershipsCol);
    result.scannedCount = snapshot.size;

    // Fetch existing notification idempotency keys for duplicate prevention
    const notifsCol = collection(db, 'gyms', gymId, 'notifications');
    const existingNotifs = await getDocs(notifsCol);
    const existingKeys = new Set<string>();
    existingNotifs.forEach(doc => {
      const k = doc.data().idempotencyKey;
      if (k) existingKeys.add(k);
    });

    for (const memDoc of snapshot.docs) {
      const membership = { id: memDoc.id, ...memDoc.data() } as Membership;
      const daysRemaining = calculateDaysRemaining(membership.expiryDate);
      const computedStatus = getMembershipStatusFromDates(membership.expiryDate);

      // Keep status up to date in Firestore if changed
      if (membership.status !== computedStatus && membership.status !== 'CANCELLED') {
        await updateDoc(doc(db, 'gyms', gymId, 'memberships', membership.id), {
          status: computedStatus,
          updatedAt: new Date().toISOString(),
        });
        if (computedStatus === 'EXPIRED') {
          result.expiredUpdated++;
        }
      }

      // Check if this membership matches one of the trigger thresholds
      const isTargetDay = settings.reminderDaysBefore.includes(daysRemaining);
      const isExpiredTrigger = settings.notifyOnExpired && daysRemaining === -1; // Notify 1 day after expiry

      if (isTargetDay || isExpiredTrigger) {
        const triggerDay = isExpiredTrigger ? -1 : daysRemaining;
        const idempotencyKey = generateExpiryIdempotencyKey(
          gymId,
          membership.id,
          triggerDay,
          membership.expiryDate
        );

        if (existingKeys.has(idempotencyKey)) {
          result.duplicateSkipped++;
          continue;
        }

        // Fetch Member details
        const memberRef = doc(db, 'gyms', gymId, 'members', membership.memberId);
        const memberSnap = await getDoc(memberRef);
        if (!memberSnap.exists()) continue;
        const member = { id: memberSnap.id, ...memberSnap.data() } as Member;

        // Compose message
        let title = '';
        let body = '';
        if (daysRemaining > 0) {
          title = `Membership Expiring in ${daysRemaining} Days`;
          body = `Hi ${member.fullName}, your ${membership.planName} membership at ${gymName} will expire on ${membership.expiryDate}. Please renew to maintain uninterrupted access.`;
        } else if (daysRemaining === 0) {
          title = 'Membership Expires Today';
          body = `Hi ${member.fullName}, your ${membership.planName} membership at ${gymName} expires today (${membership.expiryDate}).`;
        } else {
          title = 'Membership Has Expired';
          body = `Hi ${member.fullName}, your membership at ${gymName} expired on ${membership.expiryDate}. Please contact reception to reactivate.`;
        }

        // 1. Dispatch IN-APP Notification (Always reliable)
        await createNotification(gymId, {
          gymId,
          memberId: member.id,
          recipientUserId: member.userId,
          type: daysRemaining < 0 ? 'MEMBERSHIP_EXPIRED' : 'MEMBERSHIP_EXPIRING',
          channel: 'IN_APP',
          title,
          body,
          status: 'SENT',
          idempotencyKey,
        });

        // 2. Dispatch WhatsApp if opted-in and configured
        if (settings.sendWhatsAppReminders && member.communicationPreferences?.whatsappOptIn) {
          await sendWhatsAppExpiryReminder(gymId, member.phone, {
            memberName: member.fullName,
            gymName,
            daysRemaining: Math.max(0, daysRemaining),
            expiryDate: membership.expiryDate,
          });
        }

        // 3. Dispatch Email if opted-in and configured
        if (settings.sendEmailReminders && member.communicationPreferences?.emailOptIn && member.email) {
          await sendEmailReminder(
            member.email,
            title,
            `<p>${body}</p><p>Best regards,<br/><strong>${gymName}</strong></p>`
          );
        }

        existingKeys.add(idempotencyKey);
        result.remindersSent++;

        // Audit log
        await logAuditEvent(
          gymId,
          { uid: 'SYSTEM_SCHEDULER', name: 'Expiry Automation', role: 'SYSTEM' },
          'SETTINGS_UPDATED',
          'MEMBERSHIP',
          membership.id,
          {
            event: 'EXPIRY_REMINDER_SENT',
            daysRemaining,
            idempotencyKey,
            member: member.fullName,
          }
        );
      }
    }
  } catch (error: any) {
    console.error('[ExpiryAutomation] Pipeline error:', error);
    result.errors.push(error?.message || 'Unknown processing error');
  }

  return result;
}
