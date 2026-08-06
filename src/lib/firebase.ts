import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager, 
  getFirestore 
} from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import { getMessaging, isSupported as isMessagingSupported, Messaging } from 'firebase/messaging';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCjG36Cav9_UFr41pIGCLa2zv_xiIvP5n8",
  authDomain: "simulados-minint.firebaseapp.com",
  databaseURL: "https://simulados-minint-default-rtdb.firebaseio.com",
  projectId: "simulados-minint",
  storageBucket: "simulados-minint.firebasestorage.app",
  messagingSenderId: "371489175915",
  appId: "1:371489175915:web:3e586300fbd9d0a8c4742e",
  measurementId: "G-FZFZTTCFG7"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firestore with persistent local cache for seamless offline operation
export const db = (() => {
  try {
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } catch (e) {
    return getFirestore(app);
  }
})();

export const rtdb = getDatabase(app);
export const auth = getAuth(app);

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
