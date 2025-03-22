import { db } from '../firebase/config';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export interface CommunicationSettings {
  messaging: {
    defaultResponseTime: number; // in minutes
    messageRetentionPeriod: number; // in days
    fileUploadLimits: {
      maxFileSize: number; // in MB
      allowedTypes: string[];
    };
  };
  notifications: {
    push: {
      newMessages: boolean;
      messageReactions: boolean;
      fileUploads: boolean;
    };
    email: {
      messageSummaries: boolean;
      importantUpdates: boolean;
    };
  };
  autoResponse: {
    enabled: boolean;
    outsideBusinessHours: boolean;
    highMessageVolume: boolean;
    defaultMessage: string;
    businessHours: {
      start: string; // HH:mm format
      end: string; // HH:mm format
    };
  };
  templates: {
    quickResponses: string[];
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const COMMUNICATIONS_SETTINGS_COLLECTION = 'communicationsSettings';

export const getCommunicationSettings = async (adminId: string): Promise<CommunicationSettings | null> => {
  try {
    const docRef = doc(db, COMMUNICATIONS_SETTINGS_COLLECTION, adminId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as CommunicationSettings;
    }
    return null;
  } catch (error) {
    console.error('Error getting communication settings:', error);
    throw error;
  }
};

export const saveCommunicationSettings = async (adminId: string, settings: Partial<CommunicationSettings>): Promise<void> => {
  try {
    const docRef = doc(db, COMMUNICATIONS_SETTINGS_COLLECTION, adminId);
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
    console.error('Error saving communication settings:', error);
    throw error;
  }
};

export const addQuickResponse = async (adminId: string, response: string): Promise<void> => {
  try {
    const docRef = doc(db, COMMUNICATIONS_SETTINGS_COLLECTION, adminId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentSettings = docSnap.data() as CommunicationSettings;
      const updatedResponses = [...(currentSettings.templates?.quickResponses || []), response];
      
      await updateDoc(docRef, {
        'templates.quickResponses': updatedResponses,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error adding quick response:', error);
    throw error;
  }
};

export const removeQuickResponse = async (adminId: string, response: string): Promise<void> => {
  try {
    const docRef = doc(db, COMMUNICATIONS_SETTINGS_COLLECTION, adminId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentSettings = docSnap.data() as CommunicationSettings;
      const updatedResponses = (currentSettings.templates?.quickResponses || []).filter(r => r !== response);
      
      await updateDoc(docRef, {
        'templates.quickResponses': updatedResponses,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error removing quick response:', error);
    throw error;
  }
}; 