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
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured, runFirestoreOp } from '@/lib/firebase';
import { localStore } from '@/lib/localStore';
import type { Complaint, ComplaintPriority, ComplaintStatus } from '@/types';
import { logAuditEvent } from './auditService';
import { createNotification } from './notificationService';

export interface CreateComplaintInput {
  memberId: string;
  memberName: string;
  memberEmail: string;
  category: Complaint['category'];
  title: string;
  description: string;
  priority: ComplaintPriority;
  photoFiles?: File[];
  videoFile?: File;
  onUploadProgress?: (progress: number) => void;
}

export async function createComplaint(
  gymId: string,
  input: CreateComplaintInput
): Promise<Complaint> {
  const complaintId = `comp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const photoUrls: string[] = [];
  let videoUrl: string | undefined = undefined;

  // Handle photos
  if (input.photoFiles && input.photoFiles.length > 0) {
    for (const f of input.photoFiles) {
      if (isFirebaseConfigured()) {
        try {
          const fileExt = f.name.split('.').pop() || 'bin';
          const fileRef = ref(storage, `gyms/${gymId}/complaints/${complaintId}/${Date.now()}.${fileExt}`);
          const snap = await uploadBytesResumable(fileRef, f);
          const url = await getDownloadURL(snap.ref);
          photoUrls.push(url);
        } catch {
          photoUrls.push(URL.createObjectURL(f));
        }
      } else {
        photoUrls.push(URL.createObjectURL(f));
      }
    }
  }

  // Handle video
  if (input.videoFile) {
    if (isFirebaseConfigured()) {
      try {
        const fileRef = ref(storage, `gyms/${gymId}/complaints/${complaintId}/${Date.now()}.mp4`);
        const snap = await uploadBytesResumable(fileRef, input.videoFile);
        videoUrl = await getDownloadURL(snap.ref);
      } catch {
        videoUrl = URL.createObjectURL(input.videoFile);
      }
    } else {
      videoUrl = URL.createObjectURL(input.videoFile);
    }
  }

  const created: Complaint = {
    id: complaintId,
    gymId,
    memberId: input.memberId,
    memberName: input.memberName,
    memberEmail: input.memberEmail,
    category: input.category,
    title: input.title,
    description: input.description,
    photoUrls,
    videoUrl,
    priority: input.priority,
    status: 'OPEN',
    createdAt: now,
    updatedAt: now,
  };

  localStore.saveComplaint(created);

  if (isFirebaseConfigured()) {
    await runFirestoreOp(() => {
      const colRef = collection(db, 'gyms', gymId, 'complaints');
      return addDoc(colRef, created);
    });
  }

  await createNotification(gymId, {
    gymId,
    type: 'COMPLAINT_CREATED',
    channel: 'IN_APP',
    title: `New Problem Reported: ${input.title}`,
    body: `${input.memberName} reported an issue in ${input.category} (${input.priority} priority).`,
    status: 'SENT',
  });

  return created;
}

export async function getComplaints(
  gymId: string,
  memberId?: string
): Promise<Complaint[]> {
  let list: Complaint[] = [];

  if (isFirebaseConfigured()) {
    try {
      const snap = await runFirestoreOp(() => {
        const colRef = collection(db, 'gyms', gymId, 'complaints');
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
        } as Complaint));
      }
    } catch {
      // Fallback
    }
  }

  if (list.length === 0) {
    list = localStore.getComplaints(gymId);
    if (memberId) {
      list = list.filter(c => c.memberId === memberId);
    }
  }

  return list;
}

export async function updateComplaintStatus(
  gymId: string,
  complaintId: string,
  status: ComplaintStatus,
  internalNotes?: string,
  actor?: { uid: string; name: string; role: string }
): Promise<void> {
  const now = new Date().toISOString();
  const existing = localStore.getComplaints(gymId).find(c => c.id === complaintId);

  if (existing) {
    localStore.saveComplaint({
      ...existing,
      status,
      internalNotes: internalNotes !== undefined ? internalNotes : existing.internalNotes,
      resolvedAt: status === 'RESOLVED' ? now : existing.resolvedAt,
      resolvedByUid: status === 'RESOLVED' && actor ? actor.uid : existing.resolvedByUid,
      updatedAt: now,
    });
  }

  if (isFirebaseConfigured()) {
    await runFirestoreOp(() => {
      const ref = doc(db, 'gyms', gymId, 'complaints', complaintId);
      const updates: Record<string, any> = { status, updatedAt: now };
      if (internalNotes !== undefined) updates.internalNotes = internalNotes;
      if (status === 'RESOLVED') {
        updates.resolvedAt = now;
        if (actor) updates.resolvedByUid = actor.uid;
      }
      return updateDoc(ref, updates);
    });
  }

  if (existing) {
    await createNotification(gymId, {
      gymId,
      memberId: existing.memberId,
      type: 'COMPLAINT_UPDATED',
      channel: 'IN_APP',
      title: `Issue Update: ${existing.title}`,
      body: `Your report in "${existing.category}" has been updated to "${status}".`,
      status: 'SENT',
    });
  }

  if (actor) {
    await logAuditEvent(
      gymId,
      actor,
      'COMPLAINT_UPDATED',
      'COMPLAINT',
      complaintId,
      { status, notes: internalNotes }
    );
  }
}
