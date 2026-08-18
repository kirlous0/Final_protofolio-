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
  signup: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isMasterKeySession, setIsMasterKeySession] = useState<boolean>(() => {
    return sessionStorage.getItem('kw_admin_master_session') === 'true';
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
    // Verified admin key for Kirlous Wael emergency / direct developer access
    const validKeys = ['kirlous2026', 'waelkirlous', 'admin2026', 'kw_secure_admin'];
    if (validKeys.includes(key.trim().toLowerCase())) {
      sessionStorage.setItem('kw_admin_master_session', 'true');
      setIsMasterKeySession(true);
      return true;
    }
    return false;
  };

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string) => {
    await createUserWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    sessionStorage.removeItem('kw_admin_master_session');
    setIsMasterKeySession(false);
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // If user is authenticated in Firebase OR has valid developer master session
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
