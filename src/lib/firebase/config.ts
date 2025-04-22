import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { firebaseConfig } from './firebaseConfig';

// Initialize Firebase
let app;
let db;
let auth;

try {
  // Initialize or get existing app
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  
  // Initialize Firestore and Auth
  db = getFirestore(app);
  auth = getAuth(app);

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

export { app, db, auth }; 