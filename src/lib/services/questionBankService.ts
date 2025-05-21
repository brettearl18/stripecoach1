import { db } from '../firebase/config';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';

// Question type
export interface Question {
  id?: string;
  text: string;
  type: string;
  options?: string[];
  min?: number;
  max?: number;
  createdAt?: string;
  coachId?: string;
  companyId?: string;
  source?: 'user' | 'company' | 'global';
}

// User (personal) question bank
export async function addUserQuestion(coachId: string, question: Omit<Question, 'id'>) {
  const ref = collection(db, 'users', coachId, 'questions');
  const docRef = await addDoc(ref, { ...question, createdAt: new Date().toISOString(), source: 'user' });
  return { id: docRef.id, ...question };
}
export async function getUserQuestions(coachId: string): Promise<Question[]> {
  const ref = collection(db, 'users', coachId, 'questions');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Question[];
}
export async function deleteUserQuestion(coachId: string, questionId: string) {
  const ref = doc(db, 'users', coachId, 'questions', questionId);
  await deleteDoc(ref);
}

// Company question bank
export async function addCompanyQuestion(companyId: string, question: Omit<Question, 'id'>) {
  const ref = collection(db, 'companies', companyId, 'questionBank');
  const docRef = await addDoc(ref, { ...question, createdAt: new Date().toISOString(), source: 'company' });
  return { id: docRef.id, ...question };
}
export async function getCompanyQuestions(companyId: string): Promise<Question[]> {
  const ref = collection(db, 'companies', companyId, 'questionBank');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Question[];
}
export async function deleteCompanyQuestion(companyId: string, questionId: string) {
  const ref = doc(db, 'companies', companyId, 'questionBank', questionId);
  await deleteDoc(ref);
}

// Global question bank
export async function addGlobalQuestion(question: Omit<Question, 'id'>) {
  const ref = collection(db, 'global', 'questionBank', 'questions');
  const docRef = await addDoc(ref, { ...question, createdAt: new Date().toISOString(), source: 'global' });
  return { id: docRef.id, ...question };
}
export async function getGlobalQuestions(): Promise<Question[]> {
  const ref = collection(db, 'global', 'questionBank', 'questions');
  const snapshot = await getDocs(ref);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Question[];
}
export async function deleteGlobalQuestion(questionId: string) {
  const ref = doc(db, 'global', 'questionBank', 'questions', questionId);
  await deleteDoc(ref);
} 