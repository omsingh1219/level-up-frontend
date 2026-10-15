import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, runFirestoreOp } from '@/lib/firebase';
import { localStore } from '@/lib/localStore';
import type { UserProfile, UserRole } from '@/types';

export interface SignUpParams {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  gymId?: string;
  phone?: string;
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Local storage authentication mode
  if (!isFirebaseConfigured()) {
    console.info('[AuthService] Local store authentication mode');
    let localUser = localStore.getUser(normalizedEmail);

    // Auto-provision demo account if not seeded yet
    if (
      !localUser &&
      (normalizedEmail.includes('ironforge') ||
        normalizedEmail === 'admin@ironforge.com' ||
        normalizedEmail === 'staff@ironforge.com' ||
        normalizedEmail === 'marcus@athlete.com')
    ) {
      const isAdmin = normalizedEmail.includes('admin');
      const isStaff = normalizedEmail.includes('staff') || normalizedEmail.includes('pooja');
      localUser = {
        uid: isAdmin ? 'admin-ironforge-01' : isStaff ? 'staff-ironforge-01' : 'member-ironforge-01',
        name: isAdmin ? 'Vikram Rathore' : isStaff ? 'Pooja Hegde' : 'Marcus Vance',
        email: normalizedEmail,
        phone: '+91 98765 43210',
        role: isAdmin ? 'ADMIN' : isStaff ? 'STAFF' : 'MEMBER',
        gymId: 'ironforge-demo-gym',
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStore.saveUser(localUser);
    }

    if (!localUser) {
      throw new Error('No account found with this email address. Please register an account first.');
    }

    if (!localUser.active) {
      throw new Error('This account has been deactivated. Please contact your gym administrator.');
    }

    // STRICT PASSWORD VERIFICATION
    const isPasswordValid = localStore.verifyPassword(normalizedEmail, password);
    if (!isPasswordValid) {
      throw new Error('Incorrect password. Please verify your credentials and try again.');
    }

    return localUser;
  }

  // 2. Cloud Firebase Authentication mode
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;

    // Load user profile from Firestore
    const profile = await getUserProfile(fbUser.uid);
    if (profile) {
      if (!profile.active) {
        await firebaseSignOut(auth);
        throw new Error('This account has been deactivated. Please contact your gym administrator.');
      }
      return profile;
    }
  } catch (err: any) {
    if (
      err?.code === 'auth/wrong-password' ||
      err?.code === 'auth/invalid-credential' ||
      err?.code === 'auth/invalid-login-credentials'
    ) {
      throw new Error('Incorrect password. Please verify your credentials and try again.');
    }

    if (err?.code === 'auth/user-not-found') {
      throw new Error('No account found with this email address.');
    }

    // Fallback if Firebase API key is unconfigured on server
    if (
      err?.code === 'auth/api-key-not-valid' ||
      err?.code === 'auth/invalid-api-key' ||
      err?.code === 'auth/network-request-failed' ||
      err?.message?.includes('api-key-not-valid')
    ) {
      const localUser = localStore.getUser(normalizedEmail);
      if (!localUser) {
        throw new Error('No account found with this email address.');
      }
      if (!localUser.active) {
        throw new Error('This account has been deactivated.');
      }

      // Check password even in fallback!
      const isPasswordValid = localStore.verifyPassword(normalizedEmail, password);
      if (!isPasswordValid) {
        throw new Error('Incorrect password. Please verify your credentials and try again.');
      }
      return localUser;
    }
    throw err;
  }

  throw new Error('User account profile could not be found.');
}

export async function signUp(params: SignUpParams): Promise<UserProfile> {
  const now = new Date().toISOString();
  const normalizedEmail = params.email.toLowerCase().trim();

  if (!isFirebaseConfigured()) {
    console.info('[AuthService] Provisioning user in local workspace store');
    const uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const profile: UserProfile = {
      uid,
      name: params.name,
      email: normalizedEmail,
      phone: params.phone,
      role: params.role || 'ADMIN',
      gymId: params.gymId || '',
      active: true,
      createdAt: now,
      updatedAt: now,
    };
    localStore.saveUser(profile);
    localStore.saveCredential(normalizedEmail, params.password);
    return profile;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, params.email, params.password);
    const fbUser = userCredential.user;

    await updateProfile(fbUser, { displayName: params.name });

    const profile: UserProfile = {
      uid: fbUser.uid,
      name: params.name,
      email: normalizedEmail,
      phone: params.phone,
      role: params.role || 'ADMIN',
      gymId: params.gymId || '',
      active: true,
      createdAt: now,
      updatedAt: now,
    };

    await runFirestoreOp(() => setDoc(doc(db, 'users', fbUser.uid), profile));
    localStore.saveUser(profile);
    localStore.saveCredential(normalizedEmail, params.password);
    return profile;
  } catch (err: any) {
    if (
      err?.code === 'auth/api-key-not-valid' ||
      err?.code === 'auth/invalid-api-key' ||
      err?.code === 'auth/network-request-failed' ||
      err?.message?.includes('api-key-not-valid')
    ) {
      console.info('[AuthService] Falling back to local workspace store provisioning');
      const uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const profile: UserProfile = {
        uid,
        name: params.name,
        email: normalizedEmail,
        phone: params.phone,
        role: params.role || 'ADMIN',
        gymId: params.gymId || '',
        active: true,
        createdAt: now,
        updatedAt: now,
      };
      localStore.saveUser(profile);
      localStore.saveCredential(normalizedEmail, params.password);
      return profile;
    }
    throw err;
  }
}

export async function signOut(): Promise<void> {
  if (isFirebaseConfigured()) {
    try {
      await firebaseSignOut(auth);
    } catch {
      // Ignore offline error
    }
  }
}

export async function sendResetPassword(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  if (!isFirebaseConfigured()) {
    console.info(`[AuthService] Password reset simulated for ${normalizedEmail}. Reset to 'Password123!'`);
    localStore.saveCredential(normalizedEmail, 'Password123!');
    return;
  }
  try {
    await sendPasswordResetEmail(auth, normalizedEmail);
  } catch (err: any) {
    if (err?.code === 'auth/api-key-not-valid' || err?.message?.includes('api-key-not-valid')) {
      localStore.saveCredential(normalizedEmail, 'Password123!');
      return;
    }
    throw err;
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured()) {
    try {
      const snap = await runFirestoreOp(() => getDoc(doc(db, 'users', uid)));
      if (snap && snap.exists()) {
        return snap.data() as UserProfile;
      }
    } catch {
      // Fallback to local store
    }
  }
  return localStore.getUser(uid);
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'role' | 'gymId' | 'createdAt'>>
): Promise<void> {
  const existing = localStore.getUser(uid);
  if (existing) {
    localStore.saveUser({
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  if (isFirebaseConfigured()) {
    await runFirestoreOp(() => updateDoc(doc(db, 'users', uid), {
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  }
}
