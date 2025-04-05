import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getCoach } from '@/lib/services/firebaseService';

interface ExtendedUser extends User {
  role?: string;
  name?: string;
}

export function useAuth() {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional coach data
          const coachData = await getCoach(firebaseUser.uid);
          
          // Combine Firebase user with coach data
          const extendedUser: ExtendedUser = {
            ...firebaseUser,
            role: coachData?.role || 'Coach',
            name: coachData?.name
          };
          
          setUser(extendedUser);
        } catch (error) {
          console.error('Error loading coach data:', error);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
} 