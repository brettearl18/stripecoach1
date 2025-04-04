'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserRole } from '@/lib/services/roleService';
import { User, UserRole } from '@/types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async (email: string, role: UserRole) => {
    try {
      // For development, we'll just set the user directly
      const userRole = await getUserRole(email) || role;
      
      const newUser = {
        id: email, // Using email as ID for development
        email,
        name: email.split('@')[0],
        role: userRole,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Setting user:', newUser);
      setUser(newUser);
      
      // Store user in both localStorage and cookies for middleware access
      const userStr = JSON.stringify(newUser);
      localStorage.setItem('user', userStr);
      
      // Set cookie with proper attributes
      document.cookie = `user=${userStr}; path=/; max-age=86400; samesite=lax`;
      
      // Redirect based on role
      const redirectPath = `/${userRole}/dashboard`;
      window.location.href = redirectPath;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('user');
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/login';
  };

  useEffect(() => {
    // Try to restore user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Also set the cookie with proper attributes
        document.cookie = `user=${storedUser}; path=/; max-age=86400; samesite=lax`;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    }
    
    setLoading(false);

    // In production, uncomment this:
    /*
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user role from Firestore
        const userRole = await getUserRole(firebaseUser.uid);
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || '',
          role: userRole || 'client',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
    */
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 