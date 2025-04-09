import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ClientProfile } from '@/components/checkIn/ClientProfileModal';

export interface ExtendedClientProfile extends ClientProfile {
  name: string;
  profileImage?: string;
  programType: string;
  stats: {
    checkIns: number;
    totalSessions: number;
    consistency: number;
    daysStreak: number;
  };
  notifications: {
    checkInDue: boolean;
    unreadMessages: number;
  };
  program: {
    currentWeek: number;
    totalWeeks: number;
    phase: string;
  };
  lastCheckIn?: string;
  badges: Array<{
    icon: any;
    name: string;
    description: string;
    color: string;
    bgColor: string;
    achieved: boolean;
    date?: string;
    progress?: string;
  }>;
  upcomingEvents: Array<{
    id: number;
    type: string;
    title: string;
    date: string;
    time: string;
    icon: any;
    color: string;
    bgColor: string;
  }>;
}

export async function getClientProfile(userId: string): Promise<ExtendedClientProfile | null> {
  try {
    const docRef = doc(db, 'clientProfiles', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as ExtendedClientProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching client profile:', error);
    return null;
  }
}

export async function updateClientProfile(userId: string, profile: Partial<ExtendedClientProfile>) {
  try {
    const docRef = doc(db, 'clientProfiles', userId);
    await updateDoc(docRef, profile);
    return true;
  } catch (error) {
    console.error('Error updating client profile:', error);
    return false;
  }
}

export async function createClientProfile(userId: string, profile: ClientProfile) {
  try {
    const defaultProfile: ExtendedClientProfile = {
      ...profile,
      name: 'New Client',
      programType: determineInitialProgramType(profile.goals),
      stats: {
        checkIns: 0,
        totalSessions: 0,
        consistency: 100,
        daysStreak: 0
      },
      notifications: {
        checkInDue: true,
        unreadMessages: 0
      },
      program: {
        currentWeek: 1,
        totalWeeks: 12,
        phase: 'Foundation'
      },
      badges: [],
      upcomingEvents: []
    };

    const docRef = doc(db, 'clientProfiles', userId);
    await setDoc(docRef, defaultProfile);
    return defaultProfile;
  } catch (error) {
    console.error('Error creating client profile:', error);
    return null;
  }
}

function determineInitialProgramType(goals: string[]): string {
  if (goals.some(goal => goal.toLowerCase().includes('weight loss'))) {
    return 'Weight Management';
  }
  if (goals.some(goal => goal.toLowerCase().includes('muscle'))) {
    return 'Muscle Building';
  }
  if (goals.some(goal => goal.toLowerCase().includes('strength'))) {
    return 'Strength Training';
  }
  return 'General Fitness';
} 