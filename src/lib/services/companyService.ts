import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

export interface Company {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  contact: {
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
  };
  subscription: {
    plan: string;
    status: string;
    startDate: string;
    endDate?: string;
  };
  coachCount: number;
  clientCount: number;
  createdAt: string;
  updatedAt: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  settings?: {
    timezone: string;
    language: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  contacts?: {
    billing: {
      name: string;
      email: string;
      phone: string;
    };
    technical: {
      name: string;
      email: string;
      phone: string;
    };
  };
}

export async function getCompanies(): Promise<Company[]> {
  try {
    const companiesRef = collection(db, 'companies');
    const q = query(companiesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Company[];
  } catch (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }
}

export async function getCompany(id: string): Promise<Company | null> {
  try {
    const companyRef = doc(db, 'companies', id);
    const companyDoc = await getDoc(companyRef);
    
    if (!companyDoc.exists()) {
      return null;
    }
    
    return {
      id: companyDoc.id,
      ...companyDoc.data()
    } as Company;
  } catch (error) {
    console.error('Error fetching company:', error);
    throw error;
  }
}

export async function updateCompany(id: string, data: Partial<Company>): Promise<void> {
  try {
    const companyRef = doc(db, 'companies', id);
    await updateDoc(companyRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating company:', error);
    throw error;
  }
}

export async function deleteCompany(id: string): Promise<void> {
  try {
    const companyRef = doc(db, 'companies', id);
    await deleteDoc(companyRef);
  } catch (error) {
    console.error('Error deleting company:', error);
    throw error;
  }
}

export async function getCompanyCoaches(companyId: string): Promise<any[]> {
  try {
    const coachesRef = collection(db, 'coaches');
    const q = query(coachesRef, where('companyId', '==', companyId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching company coaches:', error);
    throw error;
  }
}

export async function getCompanyClients(companyId: string): Promise<any[]> {
  try {
    const clientsRef = collection(db, 'clients');
    const q = query(clientsRef, where('companyId', '==', companyId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching company clients:', error);
    throw error;
  }
}

export async function getCompanyDetails(companyId: string): Promise<Company | null> {
  try {
    const companyRef = doc(db, 'companies', companyId);
    const companySnap = await getDoc(companyRef);
    
    if (!companySnap.exists()) {
      return null;
    }

    const data = companySnap.data();
    return {
      id: companySnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as Company;
  } catch (error) {
    console.error('Error fetching company details:', error);
    throw error;
  }
} 