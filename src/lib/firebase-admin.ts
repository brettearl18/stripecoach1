import { getApps, initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin only if it hasn't been initialized
if (!getApps().length) {
  try {
    // Read the service account file
    const serviceAccountPath = path.join(process.cwd(), 'stripe-coach-firebase-adminsdk-fbsvc-212fe97e98.json');
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    initializeApp({
      credential: cert(serviceAccount as ServiceAccount),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Export admin services
export const adminAuth = getApps().length ? getAuth() : null;
export const adminDb = getApps().length ? getFirestore() : null;
export const adminStorage = getApps().length ? getStorage() : null;

// Helper function to check initialization status
export function isFirebaseAdminInitialized() {
  return {
    initialized: getApps().length > 0,
    auth: !!adminAuth,
    db: !!adminDb,
    storage: !!adminStorage,
  };
}

export default getAuth(); 