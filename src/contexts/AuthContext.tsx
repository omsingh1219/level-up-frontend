import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { UserProfile, Gym, StaffPermission } from '@/types';
import * as authService from '@/services/authService';
import { getGym } from '@/services/gymService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  gym: Gym | null;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isMember: boolean;
  hasPermission: (permission: StaffPermission) => boolean;
  signIn: (email: string, pass: string) => Promise<UserProfile>;
  signUp: (params: authService.SignUpParams) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshGym: () => Promise<void>;
  setDevUser: (profile: UserProfile, gym?: Gym) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gym, setGym] = useState<Gym | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore dev user if saved
  useEffect(() => {
    const savedDevUser = sessionStorage.getItem('gymos_dev_user');
    const savedDevGym = sessionStorage.getItem('gymos_dev_gym');
    if (savedDevUser) {
      try {
        setProfile(JSON.parse(savedDevUser));
        if (savedDevGym) setGym(JSON.parse(savedDevGym));
        setLoading(false);
      } catch (e) {
        sessionStorage.removeItem('gymos_dev_user');
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setCurrentUser(fbUser);
      if (fbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            const userProfile = userDoc.data() as UserProfile;
            setProfile(userProfile);
            sessionStorage.setItem('gymos_dev_user', JSON.stringify(userProfile));

            if (userProfile.gymId) {
              const gymData = await getGym(userProfile.gymId);
              setGym(gymData);
              if (gymData) sessionStorage.setItem('gymos_dev_gym', JSON.stringify(gymData));
            }
          }
        } catch (err) {
          console.warn('[AuthContext] Error loading user profile:', err);
        }
      } else {
        // If not using dev user from session
        if (!sessionStorage.getItem('gymos_dev_user')) {
          setProfile(null);
          setGym(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (profile?.uid) {
      const p = await authService.getUserProfile(profile.uid);
      if (p) {
        setProfile(p);
        sessionStorage.setItem('gymos_dev_user', JSON.stringify(p));
      }
    }
  };

  const refreshGym = async () => {
    if (profile?.gymId) {
      const g = await getGym(profile.gymId);
      if (g) {
        setGym(g);
        sessionStorage.setItem('gymos_dev_gym', JSON.stringify(g));
      }
    }
  };

  const signIn = async (email: string, pass: string): Promise<UserProfile> => {
    const p = await authService.signIn(email, pass);
    setProfile(p);
    sessionStorage.setItem('gymos_dev_user', JSON.stringify(p));
    if (p.gymId) {
      const g = await getGym(p.gymId);
      setGym(g);
      if (g) sessionStorage.setItem('gymos_dev_gym', JSON.stringify(g));
    }
    return p;
  };

  const signUp = async (params: authService.SignUpParams): Promise<UserProfile> => {
    const p = await authService.signUp(params);
    setProfile(p);
    sessionStorage.setItem('gymos_dev_user', JSON.stringify(p));
    return p;
  };

  const signOut = async () => {
    sessionStorage.removeItem('gymos_dev_user');
    sessionStorage.removeItem('gymos_dev_gym');
    setProfile(null);
    setGym(null);
    setCurrentUser(null);
    await authService.signOut();
  };

  const setDevUser = (devProfile: UserProfile, devGym?: Gym) => {
    setProfile(devProfile);
    sessionStorage.setItem('gymos_dev_user', JSON.stringify(devProfile));
    if (devGym) {
      setGym(devGym);
      sessionStorage.setItem('gymos_dev_gym', JSON.stringify(devGym));
    }
  };

  const isAdmin = profile?.role === 'ADMIN';
  const isStaff = profile?.role === 'STAFF' || profile?.role === 'ADMIN';
  const isMember = profile?.role === 'MEMBER';

  const hasPermission = (permission: StaffPermission): boolean => {
    if (!profile) return false;
    if (profile.role === 'ADMIN') return true;
    if (profile.role === 'STAFF' && profile.permissions) {
      return profile.permissions.includes(permission);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        gym,
        loading,
        isAdmin,
        isStaff,
        isMember,
        hasPermission,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        refreshGym,
        setDevUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
