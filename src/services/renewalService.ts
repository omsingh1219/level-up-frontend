import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured, runFirestoreOp } from '@/lib/firebase';
import { localStore } from '@/lib/localStore';
import type { RenewalRecord, PaymentMethod, PaymentStatus, MembershipStatus } from '@/types';
import { calculateExpiryDate, getMembershipStatusFromDates } from '@/utils/dateUtils';
import { logAuditEvent } from './auditService';
import { createNotification } from './notificationService';

export interface RenewMembershipInput {
  membershipId: string;
  memberId: string;
  planId: string;
  planName: string;
  durationInDays: number;
  newStartDate: string; // YYYY-MM-DD
  previousExpiryDate: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export async function renewMembership(
  gymId: string,
  input: RenewMembershipInput,
  actor: { uid: string; name: string; role: string }
): Promise<RenewalRecord> {
  const newExpiryDate = calculateExpiryDate(input.newStartDate, input.durationInDays);
  const status: MembershipStatus = getMembershipStatusFromDates(newExpiryDate);
  const now = new Date().toISOString();
  const renewalId = `ren_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const createdRecord: RenewalRecord = {
    id: renewalId,
    gymId,
    membershipId: input.membershipId,
    memberId: input.memberId,
    previousExpiryDate: input.previousExpiryDate,
    newStartDate: input.newStartDate,
    newExpiryDate,
    planId: input.planId,
    planName: input.planName,
    amount: input.amount,
    paymentStatus: input.paymentStatus,
    paymentMethod: input.paymentMethod,
    notes: input.notes,
    processedByUid: actor.uid,
    createdAt: now,
  };

  localStore.saveRenewal(createdRecord);

  // Update membership in local store
  const existingMs = localStore.getMemberships(gymId).find(m => m.id === input.membershipId);
  if (existingMs) {
    localStore.saveMembership({
      ...existingMs,
      planId: input.planId,
      planName: input.planName,
      startDate: input.newStartDate,
      expiryDate: newExpiryDate,
      amount: input.amount,
      paymentStatus: input.paymentStatus,
      paymentMethod: input.paymentMethod,
      status,
      updatedAt: now,
    });
  }

  if (isFirebaseConfigured()) {
    await runFirestoreOp(async () => {
      const renewalsCol = collection(db, 'gyms', gymId, 'renewals');
      await addDoc(renewalsCol, createdRecord);
      const membershipRef = doc(db, 'gyms', gymId, 'memberships', input.membershipId);
      await updateDoc(membershipRef, {
        planId: input.planId,
        planName: input.planName,
        startDate: input.newStartDate,
        expiryDate: newExpiryDate,
        amount: input.amount,
        paymentStatus: input.paymentStatus,
        paymentMethod: input.paymentMethod,
        status,
        updatedAt: now,
      });
    });
  }

  await logAuditEvent(
    gymId,
    actor,
    'MEMBERSHIP_RENEWED',
    'MEMBERSHIP',
    input.membershipId,
    {
      memberId: input.memberId,
      previousExpiry: input.previousExpiryDate,
      newExpiry: newExpiryDate,
      amount: input.amount,
      plan: input.planName,
    }
  );

  await createNotification(gymId, {
    gymId,
    memberId: input.memberId,
    type: 'MEMBERSHIP_RENEWED',
    channel: 'IN_APP',
    title: 'Membership Successfully Renewed',
    body: `Your ${input.planName} membership has been renewed until ${newExpiryDate}.`,
    status: 'SENT',
  });

  return createdRecord;
}

export async function getRenewals(
  gymId: string,
  memberId?: string
): Promise<RenewalRecord[]> {
  let list: RenewalRecord[] = [];

  if (isFirebaseConfigured()) {
    try {
      const snap = await runFirestoreOp(() => {
        const colRef = collection(db, 'gyms', gymId, 'renewals');
        let q = query(colRef, orderBy('createdAt', 'desc'));
        if (memberId) {
          q = query(colRef, where('memberId', '==', memberId), orderBy('createdAt', 'desc'));
        }
        return getDocs(q);
      });
      if (snap && !snap.empty) {
        list = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as RenewalRecord));
      }
    } catch {
      // Fallback
    }
  }

  if (list.length === 0) {
    list = localStore.getRenewals(gymId);
    if (memberId) {
      list = list.filter(r => r.memberId === memberId);
    }
  }

  return list;
}
