'use client';

import { auth, db } from '@/lib/firebase/firebase-client';
import { signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';

export interface UserData {
  id: string;
  email: string;
  role: string;
  lastLogin: Date;
  name?: string;
}

export interface CreateUserData {
  email: string;
  name?: string;
  role: string;
  provider?: string;
  providerId?: string;
  password?: string;
}

class AuthService {
  private static instance: AuthService | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async authenticateUser(email: string, password: string, role?: string): Promise<UserData> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const userData = userDoc.data();
      await this.updateLastLogin(user.uid);

      return {
        id: user.uid,
        email: user.email || email,
        role: userData.role,
        name: userData.name,
        lastLogin: new Date()
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<UserData | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      return {
        id: userDoc.id,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        lastLogin: userData.lastLogin?.toDate() || new Date()
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async createUser(userData: CreateUserData): Promise<UserData> {
    try {
      let uid: string;
      
      if (userData.provider) {
        // For social login, create only Firestore document
        uid = userData.providerId!;
      } else {
        // For email/password, create auth user first
        const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password!);
        uid = userCredential.user.uid;
      }

      // Create Firestore document
      const userDoc = doc(db, 'users', uid);
      await setDoc(userDoc, {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        provider: userData.provider,
        providerId: userData.providerId,
        createdAt: new Date(),
        lastLogin: new Date()
      });

      return {
        id: uid,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        lastLogin: new Date()
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<UserData | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      return {
        id: userId,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        lastLogin: userData.lastLogin instanceof Date ? userData.lastLogin : new Date()
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserRole(userId: string): Promise<string | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      return userData.role || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastLogin: new Date()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
}

// Create and export the singleton instance
const authService = AuthService.getInstance();

// Export both named and default exports
export { authService };
export default authService; 