import { db } from '../firebase/config';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { AISettings } from '../types/ai';

const AI_SETTINGS_COLLECTION = 'aiSettings';

export const getAISettings = async (adminId: string): Promise<AISettings | null> => {
  try {
    const docRef = doc(db, AI_SETTINGS_COLLECTION, adminId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as AISettings;
    }
    return null;
  } catch (error) {
    console.error('Error getting AI settings:', error);
    throw error;
  }
};

export const saveAISettings = async (adminId: string, settings: Partial<AISettings>): Promise<void> => {
  try {
    const docRef = doc(db, AI_SETTINGS_COLLECTION, adminId);
    const docSnap = await getDoc(docRef);
    
    const settingsData = {
      ...settings,
      updatedAt: serverTimestamp(),
    };

    if (docSnap.exists()) {
      await updateDoc(docRef, settingsData);
    } else {
      await setDoc(docRef, {
        ...settingsData,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error saving AI settings:', error);
    throw error;
  }
}; 