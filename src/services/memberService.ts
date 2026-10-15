import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db, isFirebaseConfigured, runFirestoreOp } from '@/lib/firebase';
import { localStore } from '@/lib/localStore';
import type { Member, MemberStatus } from '@/types';
import { logAuditEvent } from './auditService';

export interface MemberFilters {
  status?: MemberStatus;
  search?: string;
}

export async function getMembers(
  gymId: string,
  filters?: MemberFilters
): Promise<Member[]> {
  let members: Member[] = [];

  if (isFirebaseConfigured()) {
    try {
      const snap = await runFirestoreOp(() => {
        const colRef = collection(db, 'gyms', gymId, 'members');
        let q = query(colRef, orderBy('joinedAt', 'desc'));
        if (filters?.status) {
          q = query(colRef, where('status', '==', filters.status), orderBy('joinedAt', 'desc'));
        }
        return getDocs(q);
      });
      if (snap && !snap.empty) {
        members = snap.docs.map(d => ({ id: d.id, ...d.data() } as Member));
      }
    } catch {
      // Fallback to local store
    }
  }

  if (members.length === 0) {
    members = localStore.getMembers(gymId);
    if (filters?.status) {
      members = members.filter(m => m.status === filters.status);
    }
  }

  // Search filtering
  if (filters?.search && filters.search.trim() !== '') {
    const term = filters.search.toLowerCase().trim();
    members = members.filter(
      m =>
        m.fullName.toLowerCase().includes(term) ||
        m.phone.includes(term) ||
        m.email.toLowerCase().includes(term)
    );
  }

  return members;
}

export async function getMember(gymId: string, memberId: string): Promise<Member | null> {
  if (isFirebaseConfigured()) {
    try {
      const snap = await runFirestoreOp(() => {
        const ref = doc(db, 'gyms', gymId, 'members', memberId);
        return getDoc(ref);
      });
      if (snap && snap.exists()) {
        return { id: snap.id, ...snap.data() } as Member;
      }
    } catch {
      // Fallback
    }
  }

  const list = localStore.getMembers(gymId);
  return list.find(m => m.id === memberId) || null;
}

export async function createMember(
  gymId: string,
  memberData: Omit<Member, 'id' | 'gymId' | 'createdAt' | 'updatedAt'>,
  actor: { uid: string; name: string; role: string }
): Promise<Member> {
  const memberId = `member_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const created: Member = {
    ...memberData,
    id: memberId,
    gymId,
    createdAt: now,
    updatedAt: now,
  };

  localStore.saveMember(created);

  if (isFirebaseConfigured()) {
    await runFirestoreOp(() => {
      const colRef = collection(db, 'gyms', gymId, 'members');
      return addDoc(colRef, created);
    });
  }

  await logAuditEvent(
    gymId,
    actor,
    'MEMBER_CREATED',
    'MEMBER',
    memberId,
    { memberName: memberData.fullName, email: memberData.email, phone: memberData.phone }
  );

  return created;
}

export async function updateMember(
  gymId: string,
  memberId: string,
  updates: Partial<Omit<Member, 'id' | 'gymId' | 'createdAt'>>,
  actor: { uid: string; name: string; role: string }
): Promise<void> {
  const existing = localStore.getMembers(gymId).find(m => m.id === memberId);
  if (existing) {
    localStore.saveMember({
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  if (isFirebaseConfigured()) {
    await runFirestoreOp(() => {
      const ref = doc(db, 'gyms', gymId, 'members', memberId);
      return updateDoc(ref, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    });
  }

  await logAuditEvent(
    gymId,
    actor,
    'MEMBER_UPDATED',
    'MEMBER',
    memberId,
    { updates }
  );
}

export async function archiveMember(
  gymId: string,
  memberId: string,
  actor: { uid: string; name: string; role: string }
): Promise<void> {
  await updateMember(gymId, memberId, { status: 'ARCHIVED' }, actor);
  await logAuditEvent(
    gymId,
    actor,
    'MEMBER_DEACTIVATED',
    'MEMBER',
    memberId,
    { status: 'ARCHIVED' }
  );
}

export async function deleteMember(
  gymId: string,
  memberId: string,
  actor: { uid: string; name: string; role: string }
): Promise<void> {
  localStore.deleteMember(memberId);

  if (isFirebaseConfigured()) {
    await runFirestoreOp(() => {
      const ref = doc(db, 'gyms', gymId, 'members', memberId);
      return deleteDoc(ref);
    });
  }

  await logAuditEvent(
    gymId,
    actor,
    'MEMBER_DEACTIVATED',
    'MEMBER',
    memberId,
    { action: 'DELETED' }
  );
}
