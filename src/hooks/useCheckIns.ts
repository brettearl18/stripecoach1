import { useState, useEffect, useCallback } from 'react';
import { subscribeToCheckIns, subscribeToClientCheckIns, CheckIn } from '@/lib/services/firebaseService';
import { useSession } from 'next-auth/react';
import { collection, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export const useCheckIns = (userId?: string, isCoach: boolean = false) => {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!userId && !session?.user?.id) {
      setLoading(false);
      return;
    }

    const id = userId || session?.user?.id;
    let unsubscribe: () => void;

    const handleUpdate = (newCheckIns: CheckIn[]) => {
      setCheckIns(newCheckIns);
      setLoading(false);
    };

    const handleError = (err: Error) => {
      setError(err);
      setLoading(false);
    };

    if (isCoach) {
      unsubscribe = subscribeToClientCheckIns(id!, handleUpdate, handleError);
    } else {
      unsubscribe = subscribeToCheckIns(id!, handleUpdate, handleError);
    }

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userId, session?.user?.id, isCoach]);

  // Optimistic update functions
  const addCheckIn = useCallback(async (newCheckIn: Omit<CheckIn, 'id'>) => {
    try {
      // Optimistically add the check-in
      const tempId = Date.now().toString();
      const optimisticCheckIn = { ...newCheckIn, id: tempId };
      setCheckIns(prev => [...prev, optimisticCheckIn]);

      // Actually add to Firebase
      const checkInsRef = collection(db, 'checkIns');
      const docRef = await addDoc(checkInsRef, newCheckIn);

      // Update with real ID if needed
      setCheckIns(prev => 
        prev.map(checkIn => 
          checkIn.id === tempId ? { ...checkIn, id: docRef.id } : checkIn
        )
      );

      return docRef.id;
    } catch (error) {
      // Revert on error
      setCheckIns(prev => prev.filter(checkIn => checkIn.id !== Date.now().toString()));
      throw error;
    }
  }, []);

  const updateCheckIn = useCallback(async (checkInId: string, updates: Partial<CheckIn>) => {
    try {
      // Optimistically update
      setCheckIns(prev => 
        prev.map(checkIn => 
          checkIn.id === checkInId ? { ...checkIn, ...updates } : checkIn
        )
      );

      // Actually update in Firebase
      const checkInRef = doc(db, 'checkIns', checkInId);
      await updateDoc(checkInRef, updates);
    } catch (error) {
      // Revert on error
      setCheckIns(prev => 
        prev.map(checkIn => 
          checkIn.id === checkInId ? { ...checkIn, ...updates } : checkIn
        )
      );
      throw error;
    }
  }, []);

  const deleteCheckIn = useCallback(async (checkInId: string) => {
    try {
      // Store the check-in for potential recovery
      const checkInToDelete = checkIns.find(c => c.id === checkInId);
      
      // Optimistically remove
      setCheckIns(prev => prev.filter(checkIn => checkIn.id !== checkInId));

      // Actually delete from Firebase
      const checkInRef = doc(db, 'checkIns', checkInId);
      await deleteDoc(checkInRef);
    } catch (error) {
      // Revert on error
      if (checkInToDelete) {
        setCheckIns(prev => [...prev, checkInToDelete]);
      }
      throw error;
    }
  }, [checkIns]);

  return { 
    checkIns, 
    loading, 
    error,
    addCheckIn,
    updateCheckIn,
    deleteCheckIn
  };
}; 