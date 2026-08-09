import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  User,
} from 'firebase/auth';
import { initializeFirestore, doc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
  },
  (firebaseConfig as any).firestoreDatabaseId
);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
// Add Gmail & Workspace OAuth scopes
googleAuthProvider.addScope('https://mail.google.com/');
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.compose');
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.modify');
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.labels');
googleAuthProvider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory access token cache (NEVER store in localStorage or sessionStorage for security)
let cachedAccessToken: string | null = null;

export function setCachedAccessToken(token: string | null) {
  cachedAccessToken = token;
}

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  return errInfo;
}

export async function testFirebaseConnection() {
  try {
    const connectionPromise = getDoc(doc(db, 'test', 'connection'));
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('connection-timeout')), 3000)
    );
    await Promise.race([connectionPromise, timeoutPromise]);
  } catch (error) {
    // Non-blocking connection diagnostic check
    if (error instanceof Error) {
      console.warn("Firebase connection notice (app will function using cached state):", error.message);
    }
  }
}

export async function loginWithGoogle(): Promise<{ user: User | null; accessToken: string | null }> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || null;
    setCachedAccessToken(token);
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    const isPopupBlocked =
      error?.code === 'auth/popup-blocked' ||
      error?.message?.includes('popup-blocked') ||
      error?.code === 'auth/popup-closed-by-user';

    if (isPopupBlocked) {
      console.warn('Google Sign-In popup was blocked. Attempting OAuth redirect fallback...');
      try {
        await signInWithRedirect(auth, googleAuthProvider);
        return { user: auth.currentUser, accessToken: getCachedAccessToken() };
      } catch (redirectErr: any) {
        console.error('Redirect sign-in error:', redirectErr);
        throw new Error(
          'Google Sign-In popup was blocked by browser security. Please click "Open App in New Tab" or allow popups.'
        );
      }
    }
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
    setCachedAccessToken(null);
  } catch (error) {
    console.error('Logout Error:', error);
    throw error;
  }
}
