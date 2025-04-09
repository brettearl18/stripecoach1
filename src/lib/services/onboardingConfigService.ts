import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import {
  OnboardingConfig,
  OnboardingSection,
  OnboardingQuestion,
  OnboardingResponse,
} from '@/lib/types/onboarding';

const CONFIGS_COLLECTION = 'onboardingConfigs';
const RESPONSES_COLLECTION = 'onboardingResponses';

export const onboardingConfigService = {
  // Create a new onboarding configuration
  async createConfig(coachId: string, config: Omit<OnboardingConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const configRef = doc(collection(db, CONFIGS_COLLECTION));
    const now = Timestamp.now();
    
    await setDoc(configRef, {
      ...config,
      coachId,
      id: configRef.id,
      createdAt: now,
      updatedAt: now,
    });

    return configRef.id;
  },

  // Get a specific configuration
  async getConfig(configId: string): Promise<OnboardingConfig | null> {
    const configRef = doc(db, CONFIGS_COLLECTION, configId);
    const configSnap = await getDoc(configRef);
    
    if (!configSnap.exists()) return null;
    
    return {
      ...configSnap.data(),
      createdAt: configSnap.data().createdAt.toDate(),
      updatedAt: configSnap.data().updatedAt.toDate(),
    } as OnboardingConfig;
  },

  // Get all configurations for a coach
  async getCoachConfigs(coachId: string): Promise<OnboardingConfig[]> {
    const configsQuery = query(
      collection(db, CONFIGS_COLLECTION),
      where('coachId', '==', coachId),
      orderBy('createdAt', 'desc')
    );
    
    const configsSnap = await getDocs(configsQuery);
    
    return configsSnap.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as OnboardingConfig[];
  },

  // Update a configuration
  async updateConfig(configId: string, updates: Partial<OnboardingConfig>): Promise<void> {
    const configRef = doc(db, CONFIGS_COLLECTION, configId);
    await updateDoc(configRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Save client's onboarding responses
  async saveResponses(response: Omit<OnboardingResponse, 'id' | 'completedAt'>): Promise<string> {
    const responseRef = doc(collection(db, RESPONSES_COLLECTION));
    const now = Timestamp.now();
    
    await setDoc(responseRef, {
      ...response,
      id: responseRef.id,
      completedAt: now,
    });

    return responseRef.id;
  },

  // Get client's onboarding responses
  async getResponses(userId: string): Promise<OnboardingResponse[]> {
    const responsesQuery = query(
      collection(db, RESPONSES_COLLECTION),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc')
    );
    
    const responsesSnap = await getDocs(responsesQuery);
    
    return responsesSnap.docs.map(doc => ({
      ...doc.data(),
      completedAt: doc.data().completedAt.toDate(),
    })) as OnboardingResponse[];
  },

  // Get active configuration for a coach
  async getActiveConfig(coachId: string): Promise<OnboardingConfig | null> {
    const configsQuery = query(
      collection(db, CONFIGS_COLLECTION),
      where('coachId', '==', coachId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const configsSnap = await getDocs(configsQuery);
    
    if (configsSnap.empty) return null;
    
    const config = configsSnap.docs[0];
    return {
      ...config.data(),
      createdAt: config.data().createdAt.toDate(),
      updatedAt: config.data().updatedAt.toDate(),
    } as OnboardingConfig;
  },
}; 