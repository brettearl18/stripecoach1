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
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {}
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
      
      // Store user in both localStorage and cookies for middleware access
      const userStr = JSON.stringify(newUser);
      localStorage.setItem('user', userStr);
      document.cookie = `user=${encodeURIComponent(userStr)}; path=/; max-age=86400; samesite=lax`;
      
      // Set user state after storage is updated
      setUser(newUser);
      
      // Redirect based on role
      const redirectPath = `/${userRole}/dashboard`;
      window.location.href = redirectPath;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    // Clear storage first
    localStorage.removeItem('user');
    document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // Then update state
    setUser(null);
    
    // Finally redirect
    window.location.href = '/login';
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const newUser = {
        id: email,
        email,
        name: email.split('@')[0],
        role: 'client' as UserRole,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Setting new user:', newUser);
      
      // Store user in both localStorage and cookies
      const userStr = JSON.stringify(newUser);
      localStorage.setItem('user', userStr);
      document.cookie = `user=${userStr}; path=/; max-age=86400; samesite=lax`;
      
      // Set user state after storage is updated
      setUser(newUser);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const newUser = {
        id: 'google-test@example.com',
        email: 'google-test@example.com',
        name: 'Google Test User',
        role: 'client' as UserRole,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Setting Google user:', newUser);
      
      // Store user in both localStorage and cookies
      const userStr = JSON.stringify(newUser);
      localStorage.setItem('user', userStr);
      document.cookie = `user=${userStr}; path=/; max-age=86400; samesite=lax`;
      
      // Set user state after storage is updated
      setUser(newUser);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First check localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // Ensure cookie is also set
          document.cookie = `user=${encodeURIComponent(storedUser)}; path=/; max-age=86400; samesite=lax`;
        } else {
          // If no localStorage, check cookies
          const cookies = document.cookie.split(';');
          const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='));
          
          if (userCookie) {
            const userStr = decodeURIComponent(userCookie.split('=')[1]);
            try {
              const parsedUser = JSON.parse(userStr);
              setUser(parsedUser);
              
              // Sync with localStorage
              localStorage.setItem('user', userStr);
            } catch (e) {
              console.error('Error parsing user cookie:', e);
              // Clear invalid cookie
              document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
              setUser(null);
            }
          } else {
            // No auth state found
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear potentially corrupted auth state
        localStorage.removeItem('user');
        document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, signUpWithEmail, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 