import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getUserRole } from '@/lib/services/firebaseService';

interface ExtendedUser extends User {
  role?: 'coach' | 'client';
}

export function useAuth() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const role = await getUserRole(firebaseUser.uid);
        setUser({
          ...firebaseUser,
          role
        });
      } else {
        setUser(null);
      }
      setLoading(false);
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