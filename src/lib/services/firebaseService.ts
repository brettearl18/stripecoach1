import { db, auth } from '../firebase/config';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  Timestamp,
  writeBatch,
  getDoc,
  setDoc,
  Firestore,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentReference,
  DocumentData,
  QueryDocumentSnapshot,
  Query,
  CollectionReference
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';

// Helper function to check if a value has a toDate method
function hasToDate(value: unknown): value is { toDate: () => Date } {
  return Boolean(value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function');
}

// Helper function to convert dates to Firestore Timestamps
function convertDatesToTimestamps<T extends Record<string, unknown>>(data: T): T {
  if (!data) return data;
  
  const result = { ...data } as T;
  for (const [key, value] of Object.entries(result)) {
    if (value instanceof Date) {
      (result as Record<string, unknown>)[key] = Timestamp.fromDate(value);
    } else if (value && typeof value === 'object') {
      (result as Record<string, unknown>)[key] = convertDatesToTimestamps(value as Record<string, unknown>);
    }
  }
  return result;
}

// Helper function to convert Timestamps to Dates
function convertTimestampsToDates<T extends Record<string, unknown>>(data: T): T {
  if (!data) return data;
  
  const result = { ...data } as T;
  for (const [key, value] of Object.entries(result)) {
    if (hasToDate(value)) {
      (result as Record<string, unknown>)[key] = value.toDate();
    } else if (value && typeof value === 'object') {
      (result as Record<string, unknown>)[key] = convertTimestampsToDates(value as Record<string, unknown>);
    }
  }
  return result;
}

// Types
export interface Coach {
  id?: string;
  name: string;
  email: string;
  specialties: string[];
  experience: string;
  lastLoginAt?: Timestamp | null;
}

export interface Client {
  id?: string;
  name: string;
  email: string;
  coachId: string;
  goals: string[];
  avatar?: string;
  lastLoginAt?: Timestamp;
  lastCheckIn?: Timestamp;
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'client';
  name?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ClientUser extends User {
  coachId: string;
  goals: string[];
  avatar?: string;
  lastLoginAt?: Timestamp;
  lastCheckIn?: Timestamp;
  isActive: boolean;
}

// Mock data and functions for development
let mockCoaches: Coach[] = [
  {
    id: '1',
    name: 'Michael Chen',
    email: 'michael.c@stripecoach.com',
    specialties: ['Strength Training', 'Nutrition'],
    experience: '10 years',
    lastLoginAt: Timestamp.now()
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@stripecoach.com',
    specialties: ['Yoga', 'Meditation'],
    experience: '8 years',
    lastLoginAt: Timestamp.fromDate(new Date(Date.now() - 86400000)) // 1 day ago
  },
  {
    id: '3',
    name: 'Coach Silvi',
    email: 'silvi@vanahealth.com.au',
    specialties: ['HIIT', 'Weight Loss'],
    experience: '12 years',
    lastLoginAt: Timestamp.fromDate(new Date(Date.now() - 172800000)) // 2 days ago
  }
];

let mockClients: Client[] = [
  {
    id: '1',
    name: 'Sarah Wilson',
    email: 'sarah.w@example.com',
    coachId: '1',
    goals: ['Weight Loss', 'Muscle Tone', 'Better Energy'],
    lastLoginAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)), // 2 days ago
    lastCheckIn: Timestamp.fromDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)), // 3 days ago
    isActive: true
  },
  {
    id: '2',
    name: 'Mike Johnson',
    email: 'mike.j@example.com',
    coachId: '1',
    goals: ['Strength Training', 'Nutrition Planning'],
    lastLoginAt: Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)), // 5 days ago
    lastCheckIn: Timestamp.fromDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)), // 15 days ago (overdue)
    isActive: true
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma.d@example.com',
    coachId: '1',
    goals: ['Stress Management', 'Flexibility'],
    lastLoginAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), // 1 day ago
    lastCheckIn: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)), // 1 day ago
    isActive: true
  }
];

// Check-in functions
export interface CheckIn {
  id: string;
  coachId: string;
  clientId: string;
  date: string;
  status: 'pending' | 'reviewed';
  metrics: {
    [key: string]: number;
  };
}

export interface Question {
  id: string;
  type: 'text' | 'scale' | 'multipleChoice' | 'number' | 'yesNo';
  question: string;
  required: boolean;
  helpText?: string;
  options?: string[];
  validation?: {
    min: number;
    max: number;
  };
  weight: number;
  isNegative?: boolean;
}

export interface CheckInForm {
  id?: string;
  title: string;
  description: string;
  questions: Question[];
  frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  customFrequency?: number;
  availableFrom?: {
    day: string;
    time: string;
  };
  dueBy?: {
    day: string;
    time: string;
  };
  isTemplate?: boolean;
  templateName?: string;
  categoryTags?: string[];
  createdBy?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  status: 'draft' | 'active' | 'archived';
  clientGroups?: string[];
  reminderSettings?: {
    enabled: boolean;
    frequency: number;
    unit: 'hours' | 'days';
  };
}

export interface CheckInResponse {
  id?: string;
  formId: string;
  clientId: string;
  answers: {
    questionId: string;
    value: string | number | boolean | string[];
  }[];
  submittedAt: Timestamp;
  lastReminder?: Timestamp;
  status: 'completed' | 'partial' | 'missed';
}

const CHECKIN_FORMS_COLLECTION = 'checkInForms';
const CHECKIN_RESPONSES_COLLECTION = 'checkInResponses';

export const getCheckInForms = async (options?: { 
  isTemplate?: boolean; 
  status?: CheckInForm['status'];
  createdBy?: string;
}): Promise<CheckInForm[]> => {
  try {
    const formsRef = collection(db, CHECKIN_FORMS_COLLECTION);
    let formsQuery = query(formsRef);
    const conditions = [];

    if (options?.isTemplate !== undefined) {
      conditions.push(where('isTemplate', '==', options.isTemplate));
    }
    if (options?.status) {
      conditions.push(where('status', '==', options.status));
    }
    if (options?.createdBy) {
      conditions.push(where('createdBy', '==', options.createdBy));
    }

    if (conditions.length > 0) {
      formsQuery = query(formsRef, ...conditions);
    }

    const querySnapshot = await getDocs(formsQuery);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CheckInForm[];
  } catch (error) {
    console.error('Error getting check-in forms:', error);
    throw error;
  }
};

export const getClientResponses = async (clientId: string, formId?: string): Promise<CheckInResponse[]> => {
  try {
    const responsesRef = collection(db, CHECKIN_RESPONSES_COLLECTION);
    let responsesQuery = query(responsesRef);
    const conditions = [where('clientId', '==', clientId)];
    
    if (formId) {
      conditions.push(where('formId', '==', formId));
    }

    responsesQuery = query(responsesRef, ...conditions);
    const querySnapshot = await getDocs(responsesQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt : Timestamp.now(),
        status: data.status || 'completed'
      } as CheckInResponse;
    });
  } catch (error) {
    console.error('Error getting client responses:', error);
    throw error;
  }
};

// Client functions
export const getClients = async (coachId: string): Promise<Client[]> => {
  try {
    // For development, return mock clients
    return mockClients.filter(client => client.coachId === coachId);
  } catch (error) {
    console.error('Error getting clients:', error);
    throw error;
  }
};

// Check-in form functions
export const saveCheckInForm = async (formData: CheckInForm, clientIds: string[] = []): Promise<string> => {
  try {
    const formRef = collection(db, 'checkInForms');
    const docRef = await addDoc(formRef, {
      ...formData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      assignedClients: clientIds
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving check-in form:', error);
    throw error;
  }
};

export const createFromTemplate = async (templateId: string): Promise<string> => {
  try {
    const templateRef = doc(db, 'checkInForms', templateId);
    const templateDoc = await getDoc(templateRef);
    
    if (!templateDoc.exists()) {
      throw new Error('Template not found');
    }

    const templateData = templateDoc.data() as CheckInForm;
    const newFormData = {
      ...templateData,
      id: undefined,
      isTemplate: false,
      status: 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const formRef = collection(db, 'checkInForms');
    const docRef = await addDoc(formRef, newFormData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating from template:', error);
    throw error;
  }
};

export async function getCheckIns(clientId?: string): Promise<CheckIn[]> {
  try {
    const checkInsRef = collection(db, 'checkIns');
    const q = clientId 
      ? query(checkInsRef, where('clientId', '==', clientId))
      : checkInsRef;
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CheckIn[];
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    return [];
  }
}

export async function getClientById(clientId: string): Promise<Client | null> {
  try {
    const clientRef = doc(db, 'clients', clientId);
    const clientDoc = await getDoc(clientRef);
    
    if (!clientDoc.exists()) {
      return null;
    }

    return {
      id: clientDoc.id,
      ...clientDoc.data()
    } as Client;
  } catch (error) {
    console.error('Error fetching client:', error);
    return null;
  }
}

export async function getUserRole(userId: string): Promise<string | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data().role;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
} 