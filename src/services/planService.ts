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
import type { MembershipPlan } from '@/types';
import { logAuditEvent } from './auditService';

export async function getPlans(gymId: string, onlyActive = false): Promise<MembershipPlan[]> {
  let plans: MembershipPlan[] = [];

  if (isFirebaseConfigured()) {
    try {
      const snap = await runFirestoreOp(() => {
        const plansCol = collection(db, 'gyms', gymId, 'membershipPlans');
        let q = query(plansCol, orderBy('durationInDays', 'asc'));
        if (onlyActive) {
          q = query(plansCol, where('active', '==', true), orderBy('durationInDays', 'asc'));
        }
        return getDocs(q);
      });
      if (snap && !snap.empty) {
        plans = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as MembershipPlan));
      }
    } catch {
      // Fallback
    }
  }

  if (plans.length === 0) {
    plans = localStore.getPlans(gymId);
    if (onlyActive) {
      plans = plans.filter(p => p.active);
    }
  }

  return plans;
}

export async function createPlan(
  gymId: string,
  planData: Omit<MembershipPlan, 'id' | 'gymId' | 'createdAt' | 'updatedAt'>,
  actor: { uid: string; name: string; role: string }
): Promise<MembershipPlan> {
  const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const created: MembershipPlan = {
    ...planData,
    id: planId,
    gymId,
    createdAt: now,
    updatedAt: now,
  };

  localStore.savePlan(created);

  if (isFirebaseConfigured()) {
    await runFirestoreOp(() => {
      const plansCol = collection(db, 'gyms', gymId, 'membershipPlans');
      return addDoc(plansCol, created);
    });
  }

  await logAuditEvent(
    gymId,
    actor,
    'PLAN_CREATED',
    'PLAN',
    planId,
    { planName: planData.name, price: planData.price, duration: planData.durationInDays }
  );

  return created;
}

export async function updatePlan(
  gymId: string,
  planId: string,
  updates: Partial<Omit<MembershipPlan, 'id' | 'gymId' | 'createdAt'>>,
  actor: { uid: string; name: string; role: string }
): Promise<void> {
  const existing = localStore.getPlans(gymId).find(p => p.id === planId);
  if (existing) {
    localStore.savePlan({
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  if (isFirebaseConfigured()) {
    await runFirestoreOp(() => {
      const planRef = doc(db, 'gyms', gymId, 'membershipPlans', planId);
      return updateDoc(planRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    });
  }

  await logAuditEvent(
    gymId,
    actor,
    'PLAN_UPDATED',
    'PLAN',
    planId,
    { updates }
  );
}
