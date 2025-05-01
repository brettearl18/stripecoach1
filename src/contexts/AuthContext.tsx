'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '@/lib/firebase/auth';
import Cookies from 'js-cookie';

interface User {
  uid: string;
  email: string | null;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get the ID token
        const token = await firebaseUser.getIdToken();
        // Set the token in cookies
        Cookies.set('auth-token', token, { secure: true, sameSite: 'strict' });
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: 'client' // Default to client role for new users
        });
      } else {
        // Remove the token from cookies
        Cookies.remove('auth-token');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      Cookies.set('auth-token', token, { secure: true, sameSite: 'strict' });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      Cookies.remove('auth-token');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      Cookies.set('auth-token', token, { secure: true, sameSite: 'strict' });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      Cookies.set('auth-token', token, { secure: true, sameSite: 'strict' });
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signUpWithEmail, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 