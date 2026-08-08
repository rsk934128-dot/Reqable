import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, loginWithGoogle, logoutUser, testFirebaseConnection, handleFirestoreError, OperationType } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => null,
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    testFirebaseConnection();

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
    return await loginWithGoogle();
  };

  const logout = async () => {
    await logoutUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
