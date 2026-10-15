import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db, isFirebaseConfigured, runFirestoreOp } from '@/lib/firebase';
import { localStore } from '@/lib/localStore';
import type { AppNotification } from '@/types';

export async function createNotification(
  gymId: string,
  data: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>
): Promise<string> {
  const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newDoc: AppNotification = {
    ...data,
    id: notifId,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  localStore.saveNotification(newDoc);

  if (isFirebaseConfigured()) {
    await runFirestoreOp(() => {
      const colRef = collection(db, 'gyms', gymId, 'notifications');
      return addDoc(colRef, newDoc);
    });
  }

  return notifId;
}

export async function getNotifications(
  gymId: string,
  recipientUserId?: string,
  maxLimit = 30
): Promise<AppNotification[]> {
  let list: AppNotification[] = [];

  if (isFirebaseConfigured()) {
    try {
      const snapshot = await runFirestoreOp(() => {
        const colRef = collection(db, 'gyms', gymId, 'notifications');
        let q = recipientUserId
          ? query(colRef, where('recipientUserId', '==', recipientUserId), orderBy('createdAt', 'desc'), limit(maxLimit))
          : query(colRef, orderBy('createdAt', 'desc'), limit(maxLimit));
        return getDocs(q);
      });
      if (snapshot && !snapshot.empty) {
        list = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        } as AppNotification));
      }
    } catch {
      // Fallback
    }
  }

  if (list.length === 0) {
    list = localStore.getNotifications(gymId);
    if (recipientUserId) {
      list = list.filter(n => n.recipientUserId === recipientUserId);
    }
  }

  return list.slice(0, maxLimit);
}

export function subscribeToNotifications(
  gymId: string,
  recipientUserId: string | undefined,
  callback: (notifications: AppNotification[]) => void
): () => void {
  // Deliver immediate snapshot from local store
  const localList = localStore.getNotifications(gymId);
  callback(recipientUserId ? localList.filter(n => n.recipientUserId === recipientUserId) : localList);

  if (!isFirebaseConfigured()) {
    return () => {};
  }

  try {
    const colRef = collection(db, 'gyms', gymId, 'notifications');
    const q = recipientUserId
      ? query(colRef, where('recipientUserId', '==', recipientUserId), orderBy('createdAt', 'desc'), limit(30))
      : query(colRef, orderBy('createdAt', 'desc'), limit(30));

    return onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as AppNotification));
      if (list.length > 0) callback(list);
    }, () => {});
  } catch {
    return () => {};
  }
}

export async function markNotificationAsRead(gymId: string, notificationId: string): Promise<void> {
  const existing = localStore.getNotifications(gymId).find(n => n.id === notificationId);
  if (existing) {
    localStore.saveNotification({ ...existing, isRead: true });
  }

  if (isFirebaseConfigured()) {
    await runFirestoreOp(() => {
      const docRef = doc(db, 'gyms', gymId, 'notifications', notificationId);
      return updateDoc(docRef, { isRead: true });
    });
  }
}

export async function markAllNotificationsAsRead(
  gymId: string,
  recipientUserId?: string
): Promise<void> {
  const all = localStore.getNotifications(gymId);
  all.forEach(n => {
    if (!recipientUserId || n.recipientUserId === recipientUserId) {
      localStore.saveNotification({ ...n, isRead: true });
    }
  });

  if (isFirebaseConfigured()) {
    try {
      const unreadList = await getNotifications(gymId, recipientUserId, 50);
      await Promise.all(
        unreadList.filter(n => !n.isRead).map(n =>
          runFirestoreOp(() => updateDoc(doc(db, 'gyms', gymId, 'notifications', n.id), { isRead: true }))
        )
      );
    } catch {
      // Fallback
    }
  }
}
