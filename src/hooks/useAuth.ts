import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserRole } from '@/lib/services/firebaseService';

interface ExtendedUser extends User {
  role?: 'coach' | 'client';
}

export function useAuth() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const role = await getUserRole(firebaseUser.uid);
          setUser({
            ...firebaseUser,
            role
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    isCoach: user?.role === 'coach',
    isClient: user?.role === 'client',
  };
} 