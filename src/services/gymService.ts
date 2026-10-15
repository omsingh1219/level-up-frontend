import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured, runFirestoreOp } from '@/lib/firebase';
import { localStore } from '@/lib/localStore';
import type { Gym, MembershipPlan, AutomationSettings } from '@/types';
import { logAuditEvent } from './auditService';

export async function createGym(
  gymInput: Omit<Gym, 'gymId' | 'ownerUid' | 'createdAt' | 'updatedAt'>,
  ownerUid: string,
  createDefaultPlans = true
): Promise<Gym> {
  const gymId = `gym_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const gym: Gym = {
    ...gymInput,
    gymId,
    ownerUid,
    createdAt: now,
    updatedAt: now,
  };

  // 1. Save locally first for guaranteed resilience
  localStore.saveGym(gym);
  const existingOwner = localStore.getUser(ownerUid);
  if (existingOwner) {
    localStore.saveUser({
      ...existingOwner,
      gymId,
      role: 'ADMIN',
      active: true,
      updatedAt: now,
    });
  }

  // 2. Persist to Firestore Cloud if configured
  if (isFirebaseConfigured()) {
    await runFirestoreOp(async () => {
      await setDoc(doc(db, 'gyms', gymId), gym);
      await updateDoc(doc(db, 'users', ownerUid), {
        gymId,
        role: 'ADMIN',
        active: true,
        updatedAt: now,
      });

      const defaultAutomation: AutomationSettings = {
        reminderDaysBefore: [7, 3, 1, 0],
        notifyOnExpired: true,
        sendWhatsAppReminders: true,
        sendEmailReminders: true,
        sendInAppReminders: true,
        whatsappConfig: {
          phoneNumberId: '',
          businessAccountId: '',
          status: 'UNCONFIGURED',
        },
        emailConfig: {
          provider: 'NONE',
          fromEmail: 'GymOS <notifications@gymos.app>',
          replyToEmail: 'support@gymos.app',
          status: 'UNCONFIGURED',
        },
        updatedAt: now,
      };
      await setDoc(doc(db, 'gyms', gymId, 'automationSettings', 'config'), defaultAutomation);
    });
  }

  // 3. Seed initial membership plans
  if (createDefaultPlans) {
    const initialPlans: Omit<MembershipPlan, 'id' | 'gymId' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: '1 Month Standard',
        durationInDays: 30,
        price: 1500,
        description: 'Full gym access, locker facilities, and cardio equipment.',
        active: true,
      },
      {
        name: '3 Months Transformation',
        durationInDays: 90,
        price: 4000,
        description: 'Complete workout access with bi-weekly trainer fitness evaluation.',
        active: true,
      },
      {
        name: '6 Months Pro',
        durationInDays: 180,
        price: 7500,
        description: 'Unlimited access + diet guide consultation.',
        active: true,
      },
      {
        name: '12 Months Elite',
        durationInDays: 365,
        price: 13000,
        description: 'Best value all-inclusive annual membership with priority perks.',
        active: true,
      },
    ];

    for (let i = 0; i < initialPlans.length; i++) {
      const p = initialPlans[i];
      const planObj: MembershipPlan = {
        ...p,
        id: `plan_${i + 1}`,
        gymId,
        createdAt: now,
        updatedAt: now,
      };
      localStore.savePlan(planObj);

      if (isFirebaseConfigured()) {
        await runFirestoreOp(async () => {
          const plansCol = collection(db, 'gyms', gymId, 'membershipPlans');
          await addDoc(plansCol, planObj);
        });
      }
    }
  }

  // 4. Audit log
  await logAuditEvent(
    gymId,
    { uid: ownerUid, name: gymInput.name, role: 'ADMIN' },
    'SETTINGS_UPDATED',
    'SETTINGS',
    gymId,
    { message: 'Gym created and initialized with onboarding wizard' }
  );

  return gym;
}

export async function getGym(gymId: string): Promise<Gym | null> {
  if (isFirebaseConfigured()) {
    try {
      const snap = await runFirestoreOp(() => getDoc(doc(db, 'gyms', gymId)));
      if (snap && snap.exists()) {
        return snap.data() as Gym;
      }
    } catch (error) {
      // Cloud fetch failed, check local store
    }
  }
  return localStore.getGym(gymId);
}

export async function updateGym(
  gymId: string,
  updates: Partial<Omit<Gym, 'gymId' | 'ownerUid' | 'createdAt'>>,
  actorUid: string
): Promise<void> {
  const existing = localStore.getGym(gymId);
  if (existing) {
    localStore.saveGym({
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  if (isFirebaseConfigured()) {
    await runFirestoreOp(() => updateDoc(doc(db, 'gyms', gymId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  }

  await logAuditEvent(
    gymId,
    { uid: actorUid, name: 'Admin', role: 'ADMIN' },
    'SETTINGS_UPDATED',
    'SETTINGS',
    gymId,
    { updates }
  );
}
