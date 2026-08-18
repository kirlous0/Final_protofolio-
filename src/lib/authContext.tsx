import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isMasterKeySession: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithMasterKey: (key: string) => boolean;
  quickDeveloperAccess: () => void;
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_SESSION_STORAGE_KEY = 'kw_admin_master_session_v2';
const VALID_MASTER_KEYS = [
  'kirlous2026',
  'waelkirlous',
  'kirlous',
  'wael',
  'admin2026',
  'kw_secure_admin',
  'kirlouswael',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isMasterKeySession, setIsMasterKeySession] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem(MASTER_SESSION_STORAGE_KEY) === 'true' ||
        sessionStorage.getItem(MASTER_SESSION_STORAGE_KEY) === 'true'
      );
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  };

  const loginWithMasterKey = (key: string): boolean => {
    const normalized = key.trim().toLowerCase();
    const customKey = localStorage.getItem('kw_custom_passkey');

    if (VALID_MASTER_KEYS.includes(normalized) || (customKey && normalized === customKey.toLowerCase())) {
      localStorage.setItem(MASTER_SESSION_STORAGE_KEY, 'true');
      setIsMasterKeySession(true);
      return true;
    }
    return false;
  };

  const quickDeveloperAccess = () => {
    localStorage.setItem(MASTER_SESSION_STORAGE_KEY, 'true');
    setIsMasterKeySession(true);
  };

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    localStorage.removeItem(MASTER_SESSION_STORAGE_KEY);
    sessionStorage.removeItem(MASTER_SESSION_STORAGE_KEY);
    setIsMasterKeySession(false);
    await signOut(auth).catch(() => {});
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // User is admin if Firebase authenticated or Master Key verified
  const isAdmin = !!user || isMasterKeySession;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isMasterKeySession,
        login,
        loginWithGoogle,
        loginWithMasterKey,
        quickDeveloperAccess,
        signup,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
