import { db } from '@/lib/firebase/config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { UserRole } from '@/types/user';

// For development, we'll use mock data
const mockUserRoles: Record<string, UserRole> = {
  'admin@stripecoach.com': 'admin',
  'michael.c@stripecoach.com': 'coach',
  'sarah.j@stripecoach.com': 'coach',
  'silvi@vanahealth.com.au': 'coach',
  'john@example.com': 'client',
  'jane@example.com': 'client'
};

export async function assignUserRole(userId: string, role: UserRole, additionalData?: any) {
  try {
    const userRef = doc(db, 'users', userId);
    const userData = {
      role,
      updatedAt: new Date(),
      ...additionalData
    };

    await setDoc(userRef, userData, { merge: true });
    return true;
  } catch (error) {
    console.error('Error assigning user role:', error);
    return false;
  }
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  try {
    // For development, check mock data first
    const email = userId.toLowerCase();
    if (mockUserRoles[email]) {
      return mockUserRoles[email];
    }

    // If not in mock data, check Firestore
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }

    return userDoc.data().role as UserRole;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
}

// Helper function to check if a user can manage roles
export function canManageRoles(userRole: UserRole): boolean {
  return userRole === 'admin';
}

export async function setUserRole(userId: string, role: UserRole): Promise<boolean> {
  try {
    await setDoc(doc(db, 'users', userId), {
      role,
      updatedAt: new Date()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error setting user role:', error);
    return false;
  }
} 