import { auth, db } from '@/lib/firebase/firebase-client';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import authService from './authService';

export interface CoachData {
  name: string;
  email: string;
  password: string;
  specialties?: string[];
  experience?: string;
}

export async function createCoach(coachData: CoachData): Promise<string> {
  try {
    // Create the user in Firebase Auth
    const userData = await authService.createUser({
      email: coachData.email,
      password: coachData.password,
      name: coachData.name,
      role: 'coach'
    });

    // Create the coach document in Firestore
    const coachDoc = doc(db, 'coaches', userData.id);
    await setDoc(coachDoc, {
      name: coachData.name,
      email: coachData.email,
      specialties: coachData.specialties || [],
      experience: coachData.experience || '',
      lastLoginAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return userData.id;
  } catch (error) {
    console.error('Error creating coach:', error);
    throw error;
  }
} 