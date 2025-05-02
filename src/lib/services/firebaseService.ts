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
  CollectionReference,
  orderBy
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

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
  readAt?: Date;
  responseTime?: number;
}

export interface Alert {
  id: string;
  clientId: string;
  coachId?: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  createdAt: Date;
  isResolved: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  companyId: string;
  description: string;
}

// Coach related functions
export async function getCoaches(): Promise<Coach[]> {
  const coachesRef = collection(db, 'coaches');
  const snapshot = await getDocs(coachesRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestampsToDates(doc.data() as Coach)
  }));
}

export async function getCoach(coachId: string): Promise<Coach | null> {
  const coachRef = doc(db, 'coaches', coachId);
  const coachDoc = await getDoc(coachRef);
  if (!coachDoc.exists()) return null;
  return {
    id: coachDoc.id,
    ...convertTimestampsToDates(coachDoc.data() as Coach)
  };
}

export async function getClientsByCoach(coachId: string): Promise<Client[]> {
  const clientsRef = collection(db, 'clients');
  const q = query(clientsRef, where('coachId', '==', coachId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestampsToDates(doc.data() as Client)
  }));
}

export async function getUnassignedClients(): Promise<Client[]> {
  const clientsRef = collection(db, 'clients');
  const q = query(clientsRef, where('coachId', '==', null));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestampsToDates(doc.data() as Client)
  }));
}

export async function assignClientsToCoach(clientIds: string[], coachId: string): Promise<void> {
  const batch = writeBatch(db);
  clientIds.forEach(clientId => {
    const clientRef = doc(db, 'clients', clientId);
    batch.update(clientRef, { coachId });
  });
  await batch.commit();
}

export async function unassignClientFromCoach(clientId: string): Promise<void> {
  const clientRef = doc(db, 'clients', clientId);
  await updateDoc(clientRef, { coachId: null });
}

export async function updateCoach(coachId: string, data: Partial<Coach>): Promise<void> {
  const coachRef = doc(db, 'coaches', coachId);
  await updateDoc(coachRef, convertDatesToTimestamps(data));
}

export async function createTestCoach(): Promise<string> {
  const coachRef = await addDoc(collection(db, 'coaches'), {
    name: 'Test Coach',
    email: 'test.coach@example.com',
    specialties: ['Test Specialty'],
    experience: '5 years',
    lastLoginAt: serverTimestamp()
  });
  return coachRef.id;
}

export async function deleteCoach(coachId: string): Promise<void> {
  const coachRef = doc(db, 'coaches', coachId);
  await deleteDoc(coachRef);
}

export async function createTestData(): Promise<void> {
  // Create test coach
  const coachRef = await addDoc(collection(db, 'coaches'), {
    name: 'Test Coach',
    email: 'test.coach@example.com',
    specialties: ['Test Specialty'],
    experience: '5 years',
    lastLoginAt: serverTimestamp()
  });

  // Create test client
  await addDoc(collection(db, 'clients'), {
    name: 'Test Client',
    email: 'test.client@example.com',
    coachId: coachRef.id,
    goals: ['Test Goal'],
    lastLoginAt: serverTimestamp(),
    isActive: true
  });
}

// Form submission related functions
export async function getFormSubmissions(formId: string): Promise<CheckInResponse[]> {
  const responsesRef = collection(db, 'checkInResponses');
  const q = query(responsesRef, where('formId', '==', formId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...convertTimestampsToDates(doc.data() as CheckInResponse)
  }));
}

export async function saveFormSubmission(submission: CheckInResponse): Promise<string> {
  const responsesRef = collection(db, 'checkInResponses');
  const docRef = await addDoc(responsesRef, convertDatesToTimestamps(submission));
  return docRef.id;
}

// Client related functions
export async function updateClient(clientId: string, data: Partial<Client>): Promise<void> {
  const clientRef = doc(db, 'clients', clientId);
  await updateDoc(clientRef, convertDatesToTimestamps(data));
}

export async function getClient(clientId: string): Promise<Client | null> {
  const clientRef = doc(db, 'clients', clientId);
  const clientDoc = await getDoc(clientRef);
  if (!clientDoc.exists()) return null;
  return {
    id: clientDoc.id,
    ...convertTimestampsToDates(clientDoc.data() as Client)
  };
}

// Check-in related functions
export async function getCheckInForms(options?: { 
  isTemplate?: boolean; 
  status?: CheckInForm['status'];
  createdBy?: string;
}): Promise<CheckInForm[]> {
  try {
    const formsRef = collection(db, 'checkInForms');
    let q = formsRef;
    
    if (options?.isTemplate !== undefined) {
      q = query(q, where('isTemplate', '==', options.isTemplate));
    }
    
    if (options?.status) {
      q = query(q, where('status', '==', options.status));
    }
    
    if (options?.createdBy) {
      q = query(q, where('createdBy', '==', options.createdBy));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CheckInForm[];
  } catch (error) {
    console.error('Error fetching check-in forms:', error);
    return [];
  }
}

export async function getClientResponses(clientId: string, formId?: string): Promise<CheckInResponse[]> {
  try {
    const responsesRef = collection(db, 'checkInResponses');
    let q = query(responsesRef, where('clientId', '==', clientId));
    
    if (formId) {
      q = query(q, where('formId', '==', formId));
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CheckInResponse[];
  } catch (error) {
    console.error('Error fetching client responses:', error);
    return [];
  }
}

export async function getClients(coachId: string): Promise<Client[]> {
  try {
    const clientsRef = collection(db, 'clients');
    const q = query(clientsRef, where('coachId', '==', coachId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Client[];
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
}

export async function saveCheckInForm(formData: CheckInForm, clientIds: string[] = []): Promise<string[]> {
  try {
    const formsRef = collection(db, 'checkInForms');
    const createdIds: string[] = [];
    if (clientIds.length > 0) {
      for (const clientId of clientIds) {
        const docRef = await addDoc(formsRef, {
          ...formData,
          clientId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        createdIds.push(docRef.id);
      }
    } else {
      const docRef = await addDoc(formsRef, {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      createdIds.push(docRef.id);
    }
    return createdIds;
  } catch (error) {
    console.error('Error saving check-in form:', error);
    throw error;
  }
}

export async function createFromTemplate(templateId: string): Promise<string> {
  try {
    const templateRef = doc(db, 'checkInForms', templateId);
    const templateDoc = await getDoc(templateRef);
    
    if (!templateDoc.exists()) {
      throw new Error('Template not found');
    }
    
    const templateData = templateDoc.data();
    const newFormData = {
      ...templateData,
      isTemplate: false,
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
}

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

export async function getUsers(role: 'coach' | 'client' | 'admin', status: 'active' | 'inactive'): Promise<User[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      where('role', '==', role),
      where('isActive', '==', status === 'active')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestampsToDates(doc.data())
    })) as User[];
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
}

export async function getPayments(status?: string): Promise<Payment[]> {
  try {
    const paymentsRef = collection(db, 'payments');
    let q = paymentsRef;
    
    if (status) {
      q = query(paymentsRef, where('status', '==', status));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Payment[];
  } catch (error) {
    console.error('Error getting payments:', error);
    throw error;
  }
}

export async function getMessages(userId: string): Promise<Message[]> {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('senderId', '==', userId));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      readAt: doc.data().readAt?.toDate(),
    })) as Message[];
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

export async function getAlerts(isResolved: boolean): Promise<Alert[]> {
  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(
      alertsRef,
      where('isResolved', '==', isResolved),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Alert[];
  } catch (error) {
    console.error('Error getting alerts:', error);
    throw error;
  }
}