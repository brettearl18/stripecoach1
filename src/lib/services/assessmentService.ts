import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, Timestamp, Firestore } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

// Mock storage for testing
const mockAssessments = new Map<string, any>();

export interface Profile {
  name: string;
  email: string;
  age?: number;
  gender?: string;
  height?: number;
  heightUnit?: 'cm' | 'ft';
  goals?: string[];
  dietaryRestrictions?: string[];
  medicalConditions?: string[];
}

export interface Assessment {
  physicalStats: {
    currentWeight: number;
    weightUnit: 'kg' | 'lbs';
    targetWeight: number;
  };
  lifestyle: {
    sleepQuality: number;
    energyLevel: number;
    stressLevel: number;
    dietaryRestrictions: string[];
  };
  fitness: {
    currentLevel: string;
    injuries: string;
    goals: string[];
  };
  completedAt?: string;
}

export interface AssessmentProgress {
  profile?: Profile;
  selectedGoals?: string[];
  answers?: Record<string, any>;
  currentQuestionIndex?: number;
  timestamp?: string;
  lastUpdated?: string;
}

// Validation functions
const validateProfile = (profile: Profile): boolean => {
  if (!profile.name || !profile.email) return false;
  if (profile.age && (profile.age < 0 || profile.age > 120)) return false;
  if (profile.height && profile.height < 0) return false;
  return true;
};

const validateAssessmentProgress = (data: AssessmentProgress): boolean => {
  if (data.profile && !validateProfile(data.profile)) return false;
  if (data.currentQuestionIndex && data.currentQuestionIndex < 0) return false;
  return true;
};

const validateAssessment = (assessment: Assessment): boolean => {
  if (!assessment.physicalStats || !assessment.lifestyle || !assessment.fitness) return false;
  if (assessment.physicalStats.currentWeight < 0 || assessment.physicalStats.targetWeight < 0) return false;
  if (assessment.lifestyle.sleepQuality < 1 || assessment.lifestyle.sleepQuality > 5) return false;
  if (assessment.lifestyle.energyLevel < 1 || assessment.lifestyle.energyLevel > 5) return false;
  if (assessment.lifestyle.stressLevel < 1 || assessment.lifestyle.stressLevel > 5) return false;
  return true;
};

// Utility to sanitize objects for Firestore
function sanitizeForFirestore(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  } else if (obj && typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const key in obj) {
      if (obj[key] !== undefined && obj[key] !== null) {
        clean[key] = sanitizeForFirestore(obj[key]);
      }
    }
    return clean;
  }
  return obj;
}

// Core assessment functions
export const saveAssessment = async (userId: string, assessment: Assessment): Promise<boolean> => {
  try {
    if (!validateAssessment(assessment)) {
      throw new Error('Invalid assessment data');
    }
    const data = sanitizeForFirestore({
      ...assessment,
      completedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    });
    const assessmentRef = doc(db, 'assessments', userId);
    console.log('Writing assessment to Firestore:', data);
    console.log('Assessment doc path:', `assessments/${userId}`);
    try {
      await setDoc(assessmentRef, data);
    } catch (err) {
      console.error('Firestore setDoc error for assessment:', err, 'userId:', userId, 'data:', data);
      throw err;
    }

    // Update user's assessment status
    const userData = sanitizeForFirestore({
      hasCompletedAssessment: true,
      assessmentCompletedAt: new Date().toISOString()
    });
    const userRef = doc(db, 'users', userId);
    console.log('Writing user assessment status to Firestore:', userData);
    console.log('User doc path:', `users/${userId}`);
    try {
      await setDoc(userRef, userData, { merge: true });
    } catch (err) {
      console.error('Firestore setDoc error for user:', err, 'userId:', userId, 'data:', userData);
      throw err;
    }

    return true;
  } catch (error) {
    console.error('Error saving assessment:', error);
    throw new Error('Failed to save assessment');
  }
};

export const getAssessment = async (userId: string): Promise<Assessment | null> => {
  try {
    const assessmentRef = doc(db, 'assessments', userId);
    const assessmentDoc = await getDoc(assessmentRef);
    
    if (assessmentDoc.exists()) {
      const data = assessmentDoc.data() as Assessment;
      if (!validateAssessment(data)) {
        throw new Error('Invalid assessment data in database');
      }
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error getting assessment:', error);
    throw new Error('Failed to retrieve assessment');
  }
};

export const hasCompletedAssessment = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().hasCompletedAssessment || false;
    }
    return false;
  } catch (error) {
    console.error('Error checking assessment completion:', error);
    throw new Error('Failed to check assessment completion');
  }
};

export const saveAssessmentProgress = async (userId: string, data: AssessmentProgress): Promise<boolean> => {
  try {
    if (!validateAssessmentProgress(data)) {
      throw new Error('Invalid assessment data');
    }
    const cleanData = sanitizeForFirestore({
      ...data,
      lastUpdated: new Date().toISOString()
    });
    const assessmentRef = doc(db, 'assessment_progress', userId);
    console.log('Writing assessment progress to Firestore:', cleanData);
    console.log('Assessment progress doc path:', `assessment_progress/${userId}`);
    try {
      await setDoc(assessmentRef, cleanData, { merge: true });
    } catch (err) {
      console.error('Firestore setDoc error for assessment progress:', err, 'userId:', userId, 'data:', cleanData);
      throw err;
    }
    return true;
  } catch (error) {
    console.error('Error saving assessment progress:', error);
    throw new Error('Failed to save assessment progress');
  }
};

export const getAssessmentProgress = async (userId: string): Promise<AssessmentProgress | null> => {
  try {
    const assessmentRef = doc(db, 'assessment_progress', userId);
    const assessmentDoc = await getDoc(assessmentRef);
    
    if (assessmentDoc.exists()) {
      const data = assessmentDoc.data() as AssessmentProgress;
      if (!validateAssessmentProgress(data)) {
        throw new Error('Invalid assessment data in database');
      }
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error getting assessment progress:', error);
    throw new Error('Failed to retrieve assessment progress');
  }
};

export const deleteAssessmentProgress = async (userId: string): Promise<boolean> => {
  try {
    const assessmentRef = doc(db, 'assessment_progress', userId);
    await deleteDoc(assessmentRef);
    return true;
  } catch (error) {
    console.error('Error deleting assessment progress:', error);
    throw new Error('Failed to delete assessment progress');
  }
};

// Additional utility functions
export const getRecentAssessments = async (limit: number = 10): Promise<Assessment[]> => {
  try {
    const assessmentsRef = collection(db, 'assessments');
    const q = query(assessmentsRef, where('completedAt', '!=', null));
    const querySnapshot = await getDocs(q);
    
    const assessments: Assessment[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Assessment;
      if (validateAssessment(data)) {
        assessments.push(data);
      }
    });

    return assessments
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting recent assessments:', error);
    throw new Error('Failed to retrieve recent assessments');
  }
};

export const getIncompleteAssessments = async (): Promise<string[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('hasCompletedAssessment', '==', false));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error getting incomplete assessments:', error);
    throw new Error('Failed to retrieve incomplete assessments');
  }
};

// Constants
export const DIETARY_OPTIONS = [
  'None',
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Dairy-free',
  'Keto',
  'Paleo',
  'Other'
] as const;

export const RATING_OPTIONS = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Fair' },
  { value: 3, label: 'Good' },
  { value: 4, label: 'Very Good' },
  { value: 5, label: 'Excellent' }
] as const;

export const FITNESS_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
] as const; 