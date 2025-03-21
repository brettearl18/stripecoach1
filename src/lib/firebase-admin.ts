import { getApps, initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin only if it hasn't been initialized
if (!getApps().length) {
  try {
    // Use application default credentials if service account is not configured
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

    if (!projectId) {
      console.warn('Firebase Admin: Project ID not configured. Some features may not work.');
    }

    initializeApp({
      projectId,
      storageBucket,
      credential: process.env.FIREBASE_PRIVATE_KEY 
        ? cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          } as ServiceAccount)
        : undefined, // Will use application default credentials
    });
  } catch (error) {
    console.warn('Firebase Admin initialization skipped:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// Export admin services with error handling
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