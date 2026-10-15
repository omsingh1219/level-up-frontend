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
import type { Product, ProductCategory } from '@/types';
import { logAuditEvent } from './auditService';

export interface CreateProductInput {
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  active?: boolean;
}

export async function getProducts(gymId: string, onlyActive = false): Promise<Product[]> {
  let list: Product[] = [];

  if (isFirebaseConfigured()) {
    try {
      const snap = await runFirestoreOp(() => {
        const colRef = collection(db, 'gyms', gymId, 'products');
        let q = query(colRef, orderBy('createdAt', 'desc'));
        if (onlyActive) {
          q = query(colRef, where('active', '==', true), orderBy('createdAt', 'desc'));
        }
        return getDocs(q);
      });
      if (snap && !snap.empty) {
        list = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
        } as Product));
      }
    } catch {
      // Fallback
    }
  }

  if (list.length === 0) {
    list = localStore.getProducts(gymId);
    if (onlyActive) {
      list = list.filter(p => p.active);
    }
  }

  return list;
}

export async function createProduct(
  gymId: string,
  input: CreateProductInput,
  actor: { uid: string; name: string; role: string }
): Promise<Product> {
  const productId = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const created: Product = {
    ...input,
    id: productId,
    gymId,
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now,
  };

  localStore.saveProduct(created);

  if (isFirebaseConfigured()) {
    await runFirestoreOp(() => {
      const colRef = collection(db, 'gyms', gymId, 'products');
      return addDoc(colRef, created);
    });
  }

  await logAuditEvent(
    gymId,
    actor,
    'PRODUCT_CREATED',
    'PRODUCT',
    productId,
    { name: input.name, price: input.price, stock: input.stockQuantity }
  );

  return created;
}

export async function updateProduct(
  gymId: string,
  productId: string,
  updates: Partial<Omit<Product, 'id' | 'gymId' | 'createdAt'>>,
  actor: { uid: string; name: string; role: string }
): Promise<void> {
  const existing = localStore.getProducts(gymId).find(p => p.id === productId);
  if (existing) {
    localStore.saveProduct({
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  if (isFirebaseConfigured()) {
    await runFirestoreOp(() => {
      const ref = doc(db, 'gyms', gymId, 'products', productId);
      return updateDoc(ref, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    });
  }

  await logAuditEvent(
    gymId,
    actor,
    'PRODUCT_UPDATED',
    'PRODUCT',
    productId,
    { updates }
  );
}
