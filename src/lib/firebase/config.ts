import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  enableMultiTabIndexedDbPersistence,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  getFirestore as getExistingFirestore
} from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';
import { getPerformance } from 'firebase/performance';

// Initialize Firebase
let app = getApps().length ? getApp() : initializeApp(firebaseConfig);
let db;
let auth = getAuth(app);
let performance;

const initializeFirebaseApp = async () => {
  try {
    // Initialize Firestore only if it hasn't been initialized
    try {
      db = getExistingFirestore();
    } catch {
      db = initializeFirestore(app, {
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
        experimentalForceLongPolling: false,
        experimentalAutoDetectLongPolling: true,
        ignoreUndefinedProperties: true,
      });
    }

    // Enable offline persistence
    if (typeof window !== 'undefined') {
      try {
        await enableMultiTabIndexedDbPersistence(db);
      } catch (err) {
        if (err.code === 'failed-precondition') {
          await enableIndexedDbPersistence(db);
        } else if (err.code === 'unimplemented') {
          console.warn('Browser doesn\'t support persistence');
        }
      }
    }

    // Initialize Performance Monitoring in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      performance = getPerformance(app);
    }

    // Connect to emulators in development
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('Connected to Firebase emulators');
      } catch (error) {
        console.warn('Failed to connect to Firebase emulators:', error);
      }
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
};

// Initialize Firebase on the client side only
if (typeof window !== 'undefined') {
  initializeFirebaseApp();
}

export { app, db, auth, performance }; 