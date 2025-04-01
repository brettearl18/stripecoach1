import { db } from '../firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { APICredentials, APIUsage, APIRateLimit } from '@/types/api';
import crypto from 'crypto';

const API_KEYS_COLLECTION = 'apiKeys';
const API_USAGE_COLLECTION = 'apiUsage';
const API_RATE_LIMITS_COLLECTION = 'apiRateLimits';

export async function createAPIKey(
  coachId: string,
  data: Omit<APICredentials, 'id' | 'apiKey' | 'secretKey' | 'createdAt' | 'lastUsed'>
): Promise<APICredentials> {
  const apiKey = `sk_${crypto.randomBytes(24).toString('hex')}`;
  const secretKey = `sk_secret_${crypto.randomBytes(32).toString('hex')}`;

  const apiKeyData: Omit<APICredentials, 'id'> = {
    ...data,
    coachId,
    apiKey,
    secretKey,
    createdAt: new Date(),
    lastUsed: new Date(),
  };

  const docRef = await addDoc(collection(db, API_KEYS_COLLECTION), apiKeyData);
  
  // Initialize rate limit tracking
  await addDoc(collection(db, API_RATE_LIMITS_COLLECTION), {
    coachId,
    apiKeyId: docRef.id,
    currentUsage: {
      minute: 0,
      hour: 0,
      day: 0,
    },
    lastReset: {
      minute: new Date(),
      hour: new Date(),
      day: new Date(),
    },
  });

  return { id: docRef.id, ...apiKeyData };
}

export async function getAPIKeys(coachId: string): Promise<APICredentials[]> {
  const q = query(
    collection(db, API_KEYS_COLLECTION),
    where('coachId', '==', coachId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as APICredentials[];
}

export async function getAPIKey(id: string): Promise<APICredentials | null> {
  const docRef = doc(db, API_KEYS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() } as APICredentials;
}

export async function updateAPIKey(
  id: string,
  data: Partial<APICredentials>
): Promise<void> {
  const docRef = doc(db, API_KEYS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    lastUsed: serverTimestamp(),
  });
}

export async function deleteAPIKey(id: string): Promise<void> {
  const docRef = doc(db, API_KEYS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function getAPIUsage(
  coachId: string,
  apiKeyId: string,
  timeRange: 'day' | 'week' | 'month' = 'day'
): Promise<APIUsage[]> {
  const q = query(
    collection(db, API_USAGE_COLLECTION),
    where('coachId', '==', coachId),
    where('apiKeyId', '==', apiKeyId)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as APIUsage[];
}

export async function getRateLimit(
  coachId: string,
  apiKeyId: string
): Promise<APIRateLimit | null> {
  const q = query(
    collection(db, API_RATE_LIMITS_COLLECTION),
    where('coachId', '==', coachId),
    where('apiKeyId', '==', apiKeyId)
  );
  
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as APIRateLimit;
} 