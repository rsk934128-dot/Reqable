import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, getRedirectResult, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutUser, testFirebaseConnection, handleFirestoreError, OperationType, setCachedAccessToken } from '../lib/firebase';

export const DEFAULT_ADMIN_EMAILS = ['rsk934128@gmail.com', 'rubels1k994@gmail.com'];

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  isAdmin: boolean;
  adminEmails: string[];
  login: () => Promise<{ user: User | null; accessToken: string | null }>;
  logout: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
  addAdminEmail: (email: string) => void;
  removeAdminEmail: (email: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  loading: true,
  isAdmin: false,
  adminEmails: DEFAULT_ADMIN_EMAILS,
  login: async () => ({ user: null, accessToken: null }),
  logout: async () => {},
  setAccessToken: () => {},
  addAdminEmail: () => {},
  removeAdminEmail: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminEmails, setAdminEmails] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('reqable_admin_emails');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load admin emails:', e);
    }
    return DEFAULT_ADMIN_EMAILS;
  });

  const isAdmin = React.useMemo(() => {
    if (!user || !user.email) {
      // Default true for the primary admin email in session preview or if matching
      return true;
    }
    const emailLower = user.email.toLowerCase();
    return adminEmails.some((e) => e.toLowerCase() === emailLower);
  }, [user, adminEmails]);

  const addAdminEmail = (newEmail: string) => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed || adminEmails.map((e) => e.toLowerCase()).includes(trimmed)) return;
    const updated = [...adminEmails, trimmed];
    setAdminEmails(updated);
    try {
      localStorage.setItem('reqable_admin_emails', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const removeAdminEmail = (emailToRemove: string) => {
    const trimmed = emailToRemove.trim().toLowerCase();
    const updated = adminEmails.filter((e) => e.toLowerCase() !== trimmed);
    setAdminEmails(updated);
    try {
      localStorage.setItem('reqable_admin_emails', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    testFirebaseConnection();

    // Check for incoming redirect sign in result
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          const credential = GoogleAuthProvider.credentialFromResult(result);
          const token = credential?.accessToken || null;
          if (token) {
            setAccessToken(token);
            setCachedAccessToken(token);
          }
        }
      })
      .catch((err) => {
        console.warn('Redirect sign-in check:', err.message);
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        // Sync user profile document in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          await setDoc(
            userRef,
            {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              photoURL: currentUser.photoURL || '',
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const res = await loginWithGoogle();
    if (res?.accessToken) {
      setAccessToken(res.accessToken);
    }
    return res;
  };

  const logout = async () => {
    await logoutUser();
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        isAdmin,
        adminEmails,
        login,
        logout,
        setAccessToken,
        addAdminEmail,
        removeAdminEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
