import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile, StaffPermission } from '@/types';
import { logAuditEvent } from './auditService';

export interface InviteStaffInput {
  name: string;
  email: string;
  phone?: string;
  permissions: StaffPermission[];
}

export async function getStaffMembers(gymId: string): Promise<UserProfile[]> {
  try {
    const usersCol = collection(db, 'users');
    const q = query(
      usersCol,
      where('gymId', '==', gymId),
      where('role', '==', 'STAFF')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      uid: d.id,
      ...d.data(),
    } as UserProfile));
  } catch (error) {
    console.error('[StaffService] Error getting staff:', error);
    return [];
  }
}

export async function createStaffMember(
  gymId: string,
  input: InviteStaffInput,
  actor: { uid: string; name: string; role: string }
): Promise<UserProfile> {
  const staffUid = `staff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const profile: UserProfile = {
    uid: staffUid,
    name: input.name,
    email: input.email,
    phone: input.phone,
    role: 'STAFF',
    gymId,
    permissions: input.permissions,
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, 'users', staffUid), profile);

  await logAuditEvent(
    gymId,
    actor,
    'STAFF_INVITED',
    'STAFF',
    staffUid,
    { staffName: input.name, email: input.email, permissions: input.permissions }
  );

  return profile;
}

export async function updateStaffPermissions(
  gymId: string,
  staffUid: string,
  permissions: StaffPermission[],
  actor: { uid: string; name: string; role: string }
): Promise<void> {
  const ref = doc(db, 'users', staffUid);
  await updateDoc(ref, {
    permissions,
    updatedAt: new Date().toISOString(),
  });

  await logAuditEvent(
    gymId,
    actor,
    'SETTINGS_UPDATED',
    'STAFF',
    staffUid,
    { permissions }
  );
}

export async function toggleStaffStatus(
  gymId: string,
  staffUid: string,
  active: boolean,
  actor: { uid: string; name: string; role: string }
): Promise<void> {
  const ref = doc(db, 'users', staffUid);
  await updateDoc(ref, {
    active,
    updatedAt: new Date().toISOString(),
  });

  await logAuditEvent(
    gymId,
    actor,
    'SETTINGS_UPDATED',
    'STAFF',
    staffUid,
    { status: active ? 'ACTIVATED' : 'DEACTIVATED' }
  );
}
