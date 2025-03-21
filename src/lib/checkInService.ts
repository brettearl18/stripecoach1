import { db } from './firebase';
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
  orderBy,
  Timestamp,
  limit
} from 'firebase/firestore';
import type { CheckInTemplate, CheckInForm, CheckInAnswer } from '@/types/checkIn';

// Template operations
export async function createTemplate(
  coachId: string,
  template: Omit<CheckInTemplate, 'id' | 'coachId' | 'createdAt' | 'updatedAt' | 'isActive'>
): Promise<CheckInTemplate> {
  const now = new Date().toISOString();
  const templateData = {
    ...template,
    coachId,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, 'checkInTemplates'), templateData);
  return { id: docRef.id, ...templateData };
}

export async function getTemplates(coachId: string): Promise<CheckInTemplate[]> {
  const q = query(
    collection(db, 'checkInTemplates'),
    where('coachId', '==', coachId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CheckInTemplate[];
}

export async function updateTemplate(
  coachId: string,
  templateId: string,
  updates: Partial<CheckInTemplate>
): Promise<CheckInTemplate> {
  const templateRef = doc(db, 'checkInTemplates', templateId);
  const templateDoc = await getDoc(templateRef);

  if (!templateDoc.exists()) {
    throw new Error('Template not found');
  }

  const template = templateDoc.data() as CheckInTemplate;
  if (template.coachId !== coachId) {
    throw new Error('Unauthorized');
  }

  const updateData = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await updateDoc(templateRef, updateData);
  return { id: templateId, ...template, ...updateData };
}

export async function deleteTemplate(coachId: string, templateId: string): Promise<void> {
  const templateRef = doc(db, 'checkInTemplates', templateId);
  const templateDoc = await getDoc(templateRef);

  if (!templateDoc.exists()) {
    throw new Error('Template not found');
  }

  const template = templateDoc.data() as CheckInTemplate;
  if (template.coachId !== coachId) {
    throw new Error('Unauthorized');
  }

  await deleteDoc(templateRef);
}

// Form operations
export async function createForm(
  clientId: string,
  templateId: string,
  dueDate: Date
): Promise<CheckInForm> {
  const templateRef = doc(db, 'checkInTemplates', templateId);
  const templateDoc = await getDoc(templateRef);

  if (!templateDoc.exists()) {
    throw new Error('Template not found');
  }

  const template = templateDoc.data() as CheckInTemplate;
  const now = new Date().toISOString();

  const formData = {
    templateId,
    clientId,
    title: template.title,
    description: template.description,
    questions: template.questions,
    answers: [],
    status: 'pending' as const,
    dueDate: dueDate.toISOString(),
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, 'checkInForms'), formData);
  return { id: docRef.id, ...formData };
}

export async function getForms(clientId: string): Promise<CheckInForm[]> {
  const q = query(
    collection(db, 'checkInForms'),
    where('clientId', '==', clientId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CheckInForm[];
}

export async function submitAnswers(
  clientId: string,
  formId: string,
  answers: CheckInAnswer[]
): Promise<CheckInForm> {
  const formRef = doc(db, 'checkInForms', formId);
  const formDoc = await getDoc(formRef);

  if (!formDoc.exists()) {
    throw new Error('Form not found');
  }

  const form = formDoc.data() as CheckInForm;
  if (form.clientId !== clientId) {
    throw new Error('Unauthorized');
  }

  const now = new Date().toISOString();
  const updateData = {
    answers,
    status: 'completed' as const,
    completedAt: now,
    updatedAt: now,
  };

  await updateDoc(formRef, updateData);
  return { id: formId, ...form, ...updateData };
} 