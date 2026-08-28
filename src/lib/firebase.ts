import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  getFirestore,
  doc,
  getDocFromServer
} from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getMessaging, isSupported as isMessagingSupported, Messaging } from 'firebase/messaging';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firestore with persistent local cache and designated database ID
export const db = (() => {
  try {
    const firestoreSettings = {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      }),
      experimentalAutoDetectLongPolling: true,
    };
    if (firebaseConfig.firestoreDatabaseId) {
      return initializeFirestore(app, firestoreSettings, firebaseConfig.firestoreDatabaseId);
    }
    return initializeFirestore(app, firestoreSettings);
  } catch (e) {
    return firebaseConfig.firestoreDatabaseId ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : getFirestore(app);
  }
})();

// Realtime Database for quick 1v1 multiplayer duels (with safe fallback)
export const rtdb = (() => {
  try {
    const dbUrl = (firebaseConfig as any).databaseURL || `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com`;
    return getDatabase(app, dbUrl);
  } catch (e) {
    try {
      return getDatabase(app);
    } catch {
      return {} as any;
    }
  }
})();

export const auth = getAuth(app);

// Test connection silently and gracefully on boot with quick timeout to avoid hanging
export async function testConnection() {
  try {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('connection timeout')), 4000)
    );
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeoutPromise
    ]);
  } catch (error) {
    // Firestore works seamlessly in persistent offline cache mode
  }
}
testConnection();

// Standard Firestore Error Handling conforming to Firebase Skill specification
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
  console.warn('Firestore Operation Notification: ', JSON.stringify(errInfo));
  return errInfo;
}

let messagingInstance: Messaging | null = null;
export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (messagingInstance) return messagingInstance;
  try {
    const supported = await isMessagingSupported();
    if (supported) {
      messagingInstance = getMessaging(app);
      return messagingInstance;
    }
  } catch (e) {
    console.warn('Firebase Messaging não suportado neste ambiente:', e);
  }
  return null;
}

/**
 * Normalizes email or phone number to a valid email format for Firebase Auth
 * e.g., '923123456' -> '923123456@minint.ao'
 */
export function formatAuthEmail(emailOrPhone: string): string {
  const clean = emailOrPhone.trim().toLowerCase();
  if (clean.includes('@')) {
    return clean;
  }
  const sanitized = clean.replace(/[^a-z0-9]/g, '');
  return `${sanitized}@minint.ao`;
}

/**
 * Registers user with Firebase Auth using email/phone + password
 */
export async function registerWithFirebaseAuth(emailOrPhone: string, password: string): Promise<User | null> {
  const authEmail = formatAuthEmail(emailOrPhone);
  try {
    const cred = await createUserWithEmailAndPassword(auth, authEmail, password);
    return cred.user;
  } catch (error: any) {
    console.warn('Firebase Auth createUser warning:', error?.code || error?.message);
    // If account already exists in Firebase auth, try signing in with those credentials
    if (error?.code === 'auth/email-already-in-use') {
      try {
        const cred = await signInWithEmailAndPassword(auth, authEmail, password);
        return cred.user;
      } catch (signInErr) {
        throw new Error('Este E-mail ou Telemóvel já está registado com outra palavra-passe.');
      }
    }
    // Return null if Firebase Auth fails or is offline so caller can handle gracefully
    return null;
  }
}

/**
 * Signs in user with Firebase Auth using email/phone + password
 */
export async function loginWithFirebaseAuth(emailOrPhone: string, password: string): Promise<User | null> {
  const authEmail = formatAuthEmail(emailOrPhone);
  try {
    const cred = await signInWithEmailAndPassword(auth, authEmail, password);
    return cred.user;
  } catch (error: any) {
    console.warn('Firebase Auth signIn warning:', error?.code || error?.message);
    if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
      throw new Error('Palavra-passe incorreta. Por favor verifique e tente novamente.');
    }
    if (error?.code === 'auth/user-not-found') {
      throw new Error('Conta não encontrada com este E-mail ou Telemóvel.');
    }
    return null;
  }
}

/**
 * Sends a password reset email to the candidate using Firebase Auth
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Por favor introduza um endereço de e-mail válido.');
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
  } catch (error: any) {
    console.warn('Firebase Auth sendPasswordResetEmail error:', error?.code || error?.message);
    if (error?.code === 'auth/user-not-found') {
      throw new Error('Não foi encontrada nenhuma conta associada a este e-mail.');
    }
    if (error?.code === 'auth/invalid-email') {
      throw new Error('O endereço de e-mail introduzido é inválido.');
    }
    if (error?.code === 'auth/too-many-requests') {
      throw new Error('Demasiadas tentativas. Por favor aguarde alguns minutos antes de tentar novamente.');
    }
    if (error?.code === 'auth/network-request-failed') {
      throw new Error('Falha na ligação à internet. Verifique a sua conexão e tente novamente.');
    }
    throw new Error(error?.message || 'Erro ao enviar o e-mail de recuperação. Tente novamente.');
  }
}

// Helper to get or sign in anonymous user
export const getOrSignInUser = (): Promise<User> => {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      return resolve(auth.currentUser);
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          unsubscribe();
          resolve(user);
        } else {
          try {
            const userCredential = await signInAnonymously(auth);
            unsubscribe();
            resolve(userCredential.user);
          } catch (error) {
            console.warn('Autenticação anónima indisponível no Firebase. A utilizar sessão local:', error);
            unsubscribe();
            
            // Retrieve or generate persistent local user ID
            let localUid = localStorage.getItem('minint_candidate_uid');
            if (!localUid) {
              localUid = `candidato_${Math.random().toString(36).substring(2, 9)}`;
              localStorage.setItem('minint_candidate_uid', localUid);
            }

            resolve({
              uid: localUid,
              displayName: 'Candidato MININT',
              isAnonymous: true,
            } as unknown as User);
          }
        }
      },
      (error) => {
        console.warn('Erro no observador de autenticação:', error);
        unsubscribe();
        let localUid = localStorage.getItem('minint_candidate_uid');
        if (!localUid) {
          localUid = `candidato_${Math.random().toString(36).substring(2, 9)}`;
          localStorage.setItem('minint_candidate_uid', localUid);
        }

        resolve({
          uid: localUid,
          displayName: 'Candidato MININT',
          isAnonymous: true,
        } as unknown as User);
      }
    );
  });
};
