import { db } from './firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { FEATURES_BY_PLAN, SubscriptionPlan } from '@/config/subscription-plans';

interface Organization {
  id: string;
  name: string;
  plan: SubscriptionPlan;
  ownerId: string;
  createdAt: Date;
  settings: {
    branding?: {
      logo?: string;
      colors?: {
        primary: string;
        secondary: string;
      };
    };
    features?: {
      customForms: boolean;
      whiteLabel: boolean;
      apiAccess: boolean;
    };
  };
}

interface Coach {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: 'owner' | 'coach';
  permissions: {
    manageClients: boolean;
    manageCoaches: boolean;
    manageBilling: boolean;
    manageSettings: boolean;
  };
}

export async function createOrganization(data: Omit<Organization, 'id' | 'createdAt'>): Promise<string> {
  const orgRef = await addDoc(collection(db, 'organizations'), {
    ...data,
    createdAt: serverTimestamp(),
    features: FEATURES_BY_PLAN
  });
  return orgRef.id;
}

export async function getOrganization(orgId: string): Promise<Organization | null> {
  const orgDoc = await getDoc(doc(db, 'organizations', orgId));
  return orgDoc.exists() ? { id: orgDoc.id, ...orgDoc.data() } as Organization : null;
}

export async function updateOrganization(orgId: string, data: Partial<Organization>): Promise<void> {
  await updateDoc(doc(db, 'organizations', orgId), data);
}

export async function deleteOrganization(orgId: string): Promise<void> {
  await deleteDoc(doc(db, 'organizations', orgId));
}

export async function addCoachToOrganization(orgId: string, coachData: Omit<Coach, 'id' | 'organizationId'>): Promise<string> {
  const coachRef = await addDoc(collection(db, 'organizations', orgId, 'coaches'), {
    ...coachData,
    organizationId: orgId
  });
  return coachRef.id;
}

export async function getOrganizationCoaches(orgId: string): Promise<Coach[]> {
  const coachesSnapshot = await getDocs(collection(db, 'organizations', orgId, 'coaches'));
  return coachesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coach));
}

export async function updateCoach(orgId: string, coachId: string, data: Partial<Coach>): Promise<void> {
  await updateDoc(doc(db, 'organizations', orgId, 'coaches', coachId), data);
}

export async function removeCoach(orgId: string, coachId: string): Promise<void> {
  await deleteDoc(doc(db, 'organizations', orgId, 'coaches', coachId));
}

export async function getOrganizationByCoach(coachId: string): Promise<Organization | null> {
  const orgsSnapshot = await getDocs(
    query(collection(db, 'organizations'), where('coaches', 'array-contains', coachId))
  );
  
  if (orgsSnapshot.empty) return null;
  const orgDoc = orgsSnapshot.docs[0];
  return { id: orgDoc.id, ...orgDoc.data() } as Organization;
}

export async function validateOrganizationAccess(orgId: string, userId: string): Promise<boolean> {
  const org = await getOrganization(orgId);
  if (!org) return false;
  
  const coaches = await getOrganizationCoaches(orgId);
  return coaches.some(coach => coach.id === userId);
}

export async function checkFeatureAccess(orgId: string, feature: keyof typeof FEATURES_BY_PLAN): Promise<boolean> {
  const org = await getOrganization(orgId);
  if (!org) return false;
  
  return FEATURES_BY_PLAN[feature][org.plan];
} 