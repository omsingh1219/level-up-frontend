import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoDummyKeyForGymOSLocalDevMode123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gymos-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gymos-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gymos-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:demo",
};

// Initialize Firebase singleton
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Check if emulator mode is requested
const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
const emulatorHost = import.meta.env.VITE_EMULATOR_HOST || '127.0.0.1';

if (useEmulators && typeof window !== 'undefined') {
  try {
    connectAuthEmulator(auth, `http://${emulatorHost}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, emulatorHost, 8080);
    connectStorageEmulator(storage, emulatorHost, 9199);
    console.info('[GymOS] Connected to Firebase Emulators');
  } catch (err) {
    console.warn('[GymOS] Emulator connection skipped or already initialized:', err);
  }
}

/**
 * Returns true only when a valid Google Firebase API key or emulator is active.
 * Prevents Firestore and Storage web SDKs from hanging on unconfigured dev environments.
 */
export const isFirebaseConfigured = (): boolean => {
  if (useEmulators) return true;
  const key = (import.meta.env.VITE_FIREBASE_API_KEY || '').trim();
  if (!key) return false;
  if (
    key === 'demo-api-key' ||
    key.toLowerCase().includes('demo') ||
    key.toLowerCase().includes('fake') ||
    key.toLowerCase().includes('dummy') ||
    key.toLowerCase().includes('replace')
  ) {
    return false;
  }
  return key.startsWith('AIzaSy') && key.length > 25;
};

/**
 * Executes a cloud Firestore/Storage operation with a timeout guard.
 * Returns fallback immediately if Firebase is unconfigured, or on timeout.
 */
export async function runFirestoreOp<T>(
  op: () => Promise<T>,
  fallback: T | null = null,
  timeoutMs = 2500
): Promise<T | null> {
  if (!isFirebaseConfigured()) {
    return fallback;
  }
  try {
    const result = await Promise.race([
      op(),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore operation timed out')), timeoutMs)
      ),
    ]);
    return result;
  } catch (err) {
    console.warn('[GymOS Cloud] Skipping slow or failed cloud op (resilient fallback active):', err);
    return fallback;
  }
}
