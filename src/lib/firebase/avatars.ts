import { db } from './config';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  DocumentReference,
  Timestamp
} from 'firebase/firestore';
import { BusinessAvatar } from '@/lib/types/avatar';

const AVATARS_COLLECTION = 'avatars';

export interface FirestoreBusinessAvatar extends Omit<BusinessAvatar, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function createAvatar(avatar: Omit<BusinessAvatar, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collection(db, AVATARS_COLLECTION), {
      ...avatar,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating avatar:', error);
    throw error;
  }
}

export async function updateAvatar(id: string, data: Partial<BusinessAvatar>) {
  try {
    const docRef = doc(db, AVATARS_COLLECTION, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw error;
  }
}

export async function deleteAvatar(id: string) {
  try {
    await deleteDoc(doc(db, AVATARS_COLLECTION, id));
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }
}

export async function getAvatar(id: string): Promise<FirestoreBusinessAvatar | null> {
  try {
    const docRef = doc(db, AVATARS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as FirestoreBusinessAvatar;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting avatar:', error);
    throw error;
  }
}

export async function getUserAvatars(userId: string): Promise<FirestoreBusinessAvatar[]> {
  try {
    const q = query(collection(db, AVATARS_COLLECTION), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirestoreBusinessAvatar[];
  } catch (error) {
    console.error('Error getting user avatars:', error);
    throw error;
  }
} 