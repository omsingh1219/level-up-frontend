import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured, runFirestoreOp } from '@/lib/firebase';
import { localStore } from '@/lib/localStore';
import type { Membership, MembershipStatus, PaymentMethod, PaymentStatus } from '@/types';
import { calculateExpiryDate, getMembershipStatusFromDates } from '@/utils/dateUtils';
import { logAuditEvent } from './auditService';
import { createNotification } from './notificationService';

export interface AssignMembershipInput {
  memberId: string;
  planId: string;
  planName: string;
  durationInDays: number;
  startDate: string; // YYYY-MM-DD
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
}

export async function assignMembership(
  gymId: string,
  input: AssignMembershipInput,
  actor: { uid: string; name: string; role: string }
): Promise<Membership> {
  const expiryDate = calculateExpiryDate(input.startDate, input.durationInDays);
  const status: MembershipStatus = getMembershipStatusFromDates(expiryDate);
  const now = new Date().toISOString();
  const membershipId = `ms_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const created: Membership = {
    id: membershipId,
    gymId,
    memberId: input.memberId,
    planId: input.planId,
    planName: input.planName,
    startDate: input.startDate,
    expiryDate,
    amount: input.amount,
    paymentStatus: input.paymentStatus,
    paymentMethod: input.paymentMethod,
    status,
    createdAt: now,
    updatedAt: now,
  };

  localStore.saveMembership(created);

  // Update member in local store
  const existingMem = localStore.getMembers(gymId).find(m => m.id === input.memberId);
  if (existingMem) {
    localStore.saveMember({
      ...existingMem,
      currentMembershipId: membershipId,
      updatedAt: now,
    });
  }

  if (isFirebaseConfigured()) {
    await runFirestoreOp(async () => {
      const colRef = collection(db, 'gyms', gymId, 'memberships');
      await addDoc(colRef, created);
      const memberRef = doc(db, 'gyms', gymId, 'members', input.memberId);
      await updateDoc(memberRef, {
        currentMembershipId: membershipId,
        updatedAt: now,
      });
    });
  }

  // Audit log
  await logAuditEvent(
    gymId,
    actor,
    'MEMBERSHIP_CREATED',
    'MEMBERSHIP',
    membershipId,
    {
      memberId: input.memberId,
      plan: input.planName,
      startDate: input.startDate,
      expiryDate,
      amount: input.amount,
    }
  );

  // Send in-app notification
  await createNotification(gymId, {
    gymId,
    memberId: input.memberId,
    type: 'MEMBERSHIP_RENEWED',
    channel: 'IN_APP',
    title: 'Membership Assigned',
    body: `Plan ${input.planName} has been assigned. Valid until ${expiryDate}.`,
    status: 'SENT',
  });

  return created;
}

export async function getMembership(
  gymId: string,
  membershipId: string
): Promise<Membership | null> {
  if (isFirebaseConfigured()) {
    try {
      const snap = await runFirestoreOp(() => {
        const ref = doc(db, 'gyms', gymId, 'memberships', membershipId);
        return getDoc(ref);
      });
      if (snap && snap.exists()) {
        return { id: snap.id, ...snap.data() } as Membership;
      }
    } catch {
      // Fallback
    }
  }

  return localStore.getMemberships(gymId).find(m => m.id === membershipId) || null;
}

export async function getMemberMemberships(
  gymId: string,
  memberId: string
): Promise<Membership[]> {
  let list: Membership[] = [];

  if (isFirebaseConfigured()) {
    try {
      const snap = await runFirestoreOp(() => {
        const colRef = collection(db, 'gyms', gymId, 'memberships');
        const q = query(
          colRef,
          where('memberId', '==', memberId),
          orderBy('startDate', 'desc')
        );
        return getDocs(q);
      });
      if (snap && !snap.empty) {
        list = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as Membership));
      }
    } catch {
      // Fallback
    }
  }

  if (list.length === 0) {
    list = localStore.getMemberships(gymId).filter(m => m.memberId === memberId);
  }

  return list;
}

export async function getAllMemberships(gymId: string): Promise<Membership[]> {
  let list: Membership[] = [];

  if (isFirebaseConfigured()) {
    try {
      const snap = await runFirestoreOp(() => {
        const colRef = collection(db, 'gyms', gymId, 'memberships');
        return getDocs(colRef);
      });
      if (snap && !snap.empty) {
        list = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as Membership));
      }
    } catch {
      // Fallback
    }
  }

  if (list.length === 0) {
    list = localStore.getMemberships(gymId);
  }

  return list;
}
