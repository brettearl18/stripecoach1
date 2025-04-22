import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { compare } from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  password?: string;
}

export const authService = {
  async authenticateUser(email: string, password: string, role: string): Promise<User | null> {
    try {
      // Get user document from Firestore
      const userDoc = await getDoc(doc(db, 'users', email));
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data() as User;
      
      // Verify password
      if (!userData.password || !(await compare(password, userData.password))) {
        return null;
      }

      // Verify role
      if (userData.role !== role) {
        return null;
      }

      // Remove password from returned user object
      const { password: _, ...userWithoutPassword } = userData;
      
      return {
        ...userWithoutPassword,
        id: userDoc.id
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  },

  async updateLastLogin(userId: string, role: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastLogin: new Date(),
        role
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }
}; 