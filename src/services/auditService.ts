import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, isFirebaseConfigured, runFirestoreOp } from '@/lib/firebase';
import { localStore } from '@/lib/localStore';
import type { AuditAction, AuditLog } from '@/types';

export async function logAuditEvent(
  gymId: string,
  actor: { uid: string; name: string; role: string },
  action: AuditAction,
  entityType: AuditLog['entityType'],
  entityId: string,
  metadata?: Record<string, any>
): Promise<void> {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const logData: AuditLog = {
    id: logId,
    gymId,
    actorUid: actor.uid,
    actorName: actor.name,
    actorRole: actor.role,
    action,
    entityType,
    entityId,
    metadata: metadata || {},
    timestamp: new Date().toISOString(),
  };

  localStore.saveAuditLog(logData);

  if (isFirebaseConfigured()) {
    await runFirestoreOp(() => {
      const logsCol = collection(db, 'gyms', gymId, 'auditLogs');
      return addDoc(logsCol, logData);
    });
  }
}

export async function getAuditLogs(gymId: string, maxLimit = 50): Promise<AuditLog[]> {
  let list: AuditLog[] = [];

  if (isFirebaseConfigured()) {
    try {
      const snapshot = await runFirestoreOp(() => {
        const logsCol = collection(db, 'gyms', gymId, 'auditLogs');
        const q = query(logsCol, orderBy('timestamp', 'desc'), limit(maxLimit));
        return getDocs(q);
      });
      if (snapshot && !snapshot.empty) {
        list = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AuditLog));
      }
    } catch {
      // Fallback
    }
  }

  if (list.length === 0) {
    list = localStore.getAuditLogs(gymId);
  }

  return list.slice(0, maxLimit);
}
