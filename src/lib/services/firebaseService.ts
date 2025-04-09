import { db } from '../firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  Timestamp,
  writeBatch,
  getDoc,
  setDoc,
  Firestore
} from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';

// Helper function to check if a value has a toDate method
function hasToDate(value: any): value is { toDate: () => Date } {
  return value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function';
}

// Helper function to convert dates to Firestore Timestamps
function convertDatesToTimestamps(data: any): any {
  if (!data) return data;
  
  const result = { ...data };
  for (const [key, value] of Object.entries(result)) {
    if (value instanceof Date) {
      result[key] = Timestamp.fromDate(value);
    } else if (value && typeof value === 'object') {
      result[key] = convertDatesToTimestamps(value);
    }
  }
  return result;
}

// Helper function to convert Timestamps to Dates
function convertTimestampsToDates(data: any): any {
  if (!data) return data;
  
  const result = { ...data };
  for (const [key, value] of Object.entries(result)) {
    if (hasToDate(value)) {
      result[key] = value.toDate();
    } else if (value && typeof value === 'object') {
      result[key] = convertTimestampsToDates(value);
    }
  }
  return result;
}

// Types
export interface Coach {
  id?: string;
  name: string;
  email: string;
  specialties: string[];
  experience: string;
  lastLoginAt?: Date | null;
}

export interface Client {
  id?: string;
  name: string;
  email: string;
  coachId: string;
  goals: string[];
  avatar?: string;
  lastLoginAt?: Date;
  lastCheckIn?: Date;
  isActive: boolean;
}

// Check-in functions
export interface CheckIn {
  id: string;
  clientId: string;
  coachId: string;
  date: string;
  status: 'pending' | 'completed' | 'reviewed';
  type: 'weekly' | 'monthly' | 'custom';
  data: Record<string, any>;
}

// Add these interfaces at the top with other interfaces
interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'client';
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientUser extends User {
  coachId: string;
  goals: string[];
  avatar?: string;
  lastLoginAt?: Date;
  lastCheckIn?: Date;
  isActive: boolean;
}

// Mock data and functions for development
let mockCoaches: Coach[] = [
  {
    id: '1',
    name: 'Michael Chen',
    email: 'michael.c@stripecoach.com',
    specialties: ['Strength Training', 'Nutrition'],
    experience: '10 years',
    lastLoginAt: new Date()
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@stripecoach.com',
    specialties: ['Yoga', 'Meditation'],
    experience: '8 years',
    lastLoginAt: new Date(Date.now() - 86400000) // 1 day ago
  },
  {
    id: '3',
    name: 'Coach Silvi',
    email: 'silvi@vanahealth.com.au',
    specialties: ['HIIT', 'Weight Loss'],
    experience: '12 years',
    lastLoginAt: new Date(Date.now() - 172800000) // 2 days ago
  }
];

let mockClients: Client[] = [
  {
    id: '1',
    name: 'Sarah Wilson',
    email: 'sarah.w@example.com',
    coachId: '1',
    goals: ['Weight Loss', 'Muscle Tone', 'Better Energy'],
    lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    lastCheckIn: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isActive: true
  },
  {
    id: '2',
    name: 'Mike Johnson',
    email: 'mike.j@example.com',
    coachId: '1',
    goals: ['Strength Training', 'Nutrition Planning'],
    lastLoginAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    lastCheckIn: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago (overdue)
    isActive: true
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma.d@example.com',
    coachId: '1',
    goals: ['Stress Management', 'Flexibility'],
    lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    lastCheckIn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    isActive: true
  }
];

// Mock check-ins data
let mockCheckIns = [
  // Sarah Wilson's check-ins
  {
    id: 'ci1',
    clientId: '1',
    coachId: '1',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    type: 'weekly',
    responses: {
      "How many training sessions did you complete this week?": "4 out of 5 planned sessions",
      "Rate your overall energy levels (1-10)": "7",
      "How is your sleep quality (1-10)?": "8",
      "Are you experiencing any pain or discomfort?": "Slight soreness from yesterday's workout",
      "What's your current body weight?": "68kg",
      "How many steps are you averaging daily?": "8,500",
      "Rate your stress levels (1-10)": "6",
      "Are you following the nutrition plan?": "Yes, about 90% adherence",
      "What challenges did you face this week?": "Had a busy work schedule but managed to fit in most workouts",
      "What wins would you like to celebrate?": "Increased my water intake and hit my protein goals every day"
    },
    metrics: {
      bodyweight: {
        current: 68,
        previous: 68.5,
        change: -0.5,
        trend: "down"
      },
      energyLevel: {
        current: 7,
        previous: 6,
        change: 1,
        trend: "up"
      },
      sleepQuality: {
        current: 8,
        previous: 7,
        change: 1,
        trend: "up"
      }
    }
  },
  // Mike Johnson's check-ins (overdue)
  {
    id: 'ci2',
    clientId: '2',
    coachId: '1',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    type: 'weekly',
    responses: {
      "How many training sessions did you complete this week?": "3 out of 5 planned sessions",
      "Rate your overall energy levels (1-10)": "5",
      "How is your sleep quality (1-10)?": "6",
      "Are you experiencing any pain or discomfort?": "No pain",
      "What's your current body weight?": "82kg",
      "How many steps are you averaging daily?": "6,000",
      "Rate your stress levels (1-10)": "7",
      "Are you following the nutrition plan?": "Struggling with consistency",
      "What challenges did you face this week?": "Work travel made it hard to stick to routine",
      "What wins would you like to celebrate?": "Still managed to get in three workouts despite travel"
    },
    metrics: {
      bodyweight: {
        current: 82,
        previous: 81.5,
        change: 0.5,
        trend: "up"
      },
      energyLevel: {
        current: 5,
        previous: 7,
        change: -2,
        trend: "down"
      },
      sleepQuality: {
        current: 6,
        previous: 7,
        change: -1,
        trend: "down"
      }
    }
  },
  // Emma Davis's check-ins
  {
    id: 'ci3',
    clientId: '3',
    coachId: '1',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    type: 'weekly',
    responses: {
      "How many training sessions did you complete this week?": "5 out of 5 planned sessions",
      "Rate your overall energy levels (1-10)": "9",
      "How is your sleep quality (1-10)?": "8",
      "Are you experiencing any pain or discomfort?": "None",
      "What's your current body weight?": "63kg",
      "How many steps are you averaging daily?": "12,000",
      "Rate your stress levels (1-10)": "4",
      "Are you following the nutrition plan?": "100% adherence this week",
      "What challenges did you face this week?": "None major",
      "What wins would you like to celebrate?": "Perfect week of training and nutrition!"
    },
    metrics: {
      bodyweight: {
        current: 63,
        previous: 63.5,
        change: -0.5,
        trend: "down"
      },
      energyLevel: {
        current: 9,
        previous: 8,
        change: 1,
        trend: "up"
      },
      sleepQuality: {
        current: 8,
        previous: 8,
        change: 0,
        trend: "stable"
      }
    }
  },
  // Add this new mock check-in to the mockCheckIns array
  {
    id: 'ci4',
    clientId: '1', // Sarah Wilson's check-in
    coachId: '1',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    status: 'pending',
    type: 'weekly',
    responses: {
      "How would you rate your meal preparation this week?": "8",
      "How many meals did you eat out this week?": "3",
      "Which areas of nutrition need improvement?": ["Portion Control", "Water Intake"],
      "How many workouts did you complete this week?": "5",
      "How would you rate your workout intensity?": "9",
      "Did you experience any injuries or pain?": false,
      "How would you rate your overall motivation this week?": "8",
      "What were your biggest challenges this week?": "Work was very busy, making it hard to stick to meal prep schedule",
      "What are you most proud of this week?": "Completed all my planned workouts despite the busy schedule",
      "How many hours of sleep did you average this week?": "7",
      "How would you rate your stress levels this week?": "6",
      "Do you have any notes or requests for your coach?": "Could we adjust my meal plan to include more quick-prep options?",
      "What is the biggest win you have had since last check in?": "Hit a new personal record on my deadlift!"
    },
    metrics: {
      bodyweight: {
        current: 67.5,
        previous: 68,
        change: -0.5,
        trend: "down"
      },
      energyLevel: {
        current: 8,
        previous: 7,
        change: 1,
        trend: "up"
      },
      sleepQuality: {
        current: 7,
        previous: 7,
        change: 0,
        trend: "stable"
      }
    }
  }
];

// Coach functions
export const getCoaches = async (): Promise<Coach[]> => {
  return mockCoaches;
};

export const getCoach = async (coachId: string): Promise<Coach | null> => {
  try {
    // First check mock data
    const mockCoach = mockCoaches.find(c => c.id === coachId);
    if (mockCoach) {
      return mockCoach;
    }

    // If not in mock data, query Firestore
    const coachDoc = await getDoc(doc(db as Firestore, 'coaches', coachId));
    if (!coachDoc.exists()) {
      return null;
    }

    const coachData = coachDoc.data();
    return {
      id: coachDoc.id,
      name: coachData.name,
      email: coachData.email,
      specialties: coachData.specialties || [],
      experience: coachData.experience || '',
      lastLoginAt: coachData.lastLoginAt?.toDate() || null
    };
  } catch (error) {
    console.error('Error getting coach:', error);
    return null;
  }
};

export const createTestCoach = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const auth = getAuth();
    let user: FirebaseUser;
    
    try {
      // Try to create new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists' || error.code === 'auth/email-already-in-use') {
        // If user exists, try to sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
      } else {
        throw error;
      }
    }

    // Create or update the coach profile in Firestore
    await setDoc(doc(db as Firestore, 'coaches', user.uid), {
      email: user.email,
      role: 'coach',
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true }); // Using merge: true to update if exists

    return user;
  } catch (error) {
    console.error('Error creating/updating test coach:', error);
    throw error;
  }
};

export const updateCoach = async (id: string, coachData: Partial<Coach>): Promise<Coach> => {
  const index = mockCoaches.findIndex(coach => coach.id === id);
  if (index === -1) throw new Error('Coach not found');
  
  mockCoaches[index] = {
    ...mockCoaches[index],
    ...coachData
  };
  return mockCoaches[index];
};

export const deleteCoach = async (id: string): Promise<void> => {
  mockCoaches = mockCoaches.filter(coach => coach.id !== id);
};

// Client functions
export const getClientsByCoach = async (coachId: string): Promise<Client[]> => {
  return mockClients.filter(client => client.coachId === coachId);
};

export const getClientById = async (clientId: string): Promise<Client | null> => {
  return mockClients.find(client => client.id === clientId) || null;
};

export const getClients = async (): Promise<Client[]> => {
  try {
    // First try to get from mock data for development
    if (mockClients.length > 0) {
      return mockClients;
    }

    // If no mock data, try Firestore
    const clientsRef = collection(db as Firestore, 'clients');
    const querySnapshot = await getDocs(clientsRef);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...convertTimestampsToDates(data),
        goals: Array.isArray(data.goals) ? data.goals : []
      } as Client;
    });
  } catch (error) {
    console.error('Error getting clients:', error);
    throw error;
  }
};

export async function createTestData() {
  try {
    const batch = writeBatch(db as Firestore);
    const clientsRef = collection(db as Firestore, 'clients');
    const analyticsRef = collection(db as Firestore, 'clientAnalytics');

    // Get all coaches
    const coaches = await getCoaches();

    // Client templates with varying compliance patterns
    const clientTemplates = [
      {
        type: 'High Achiever',
        goals: ['Weight Loss', 'Muscle Gain', 'Better Nutrition'],
        completionRate: () => 0.9 + Math.random() * 0.1, // 90-100%
        consistency: () => 85 + Math.random() * 15, // 85-100
        focusAreas: ['Exercise Tracking', 'Meal Planning', 'Progress Photos']
      },
      {
        type: 'Steady Progress',
        goals: ['General Fitness', 'Stress Reduction', 'Work-Life Balance'],
        completionRate: () => 0.7 + Math.random() * 0.2, // 70-90%
        consistency: () => 65 + Math.random() * 20, // 65-85
        focusAreas: ['Daily Movement', 'Mindfulness', 'Sleep Quality']
      },
      {
        type: 'Inconsistent',
        goals: ['Weight Management', 'Flexibility', 'Energy Levels'],
        completionRate: () => 0.4 + Math.random() * 0.3, // 40-70%
        consistency: () => 40 + Math.random() * 25, // 40-65
        focusAreas: ['Workout Routine', 'Healthy Eating', 'Recovery']
      },
      {
        type: 'Struggling',
        goals: ['Getting Started', 'Habit Formation', 'Basic Fitness'],
        completionRate: () => 0.1 + Math.random() * 0.3, // 10-40%
        consistency: () => 10 + Math.random() * 30, // 10-40
        focusAreas: ['Basic Exercise', 'Simple Nutrition', 'Daily Habits']
      }
    ];

    // Client names for each coach
    const clientGroups = [
      [
        { name: 'Emma Thompson', email: 'emma.t@example.com' },
        { name: 'Alexander Kim', email: 'alex.kim@example.com' },
        { name: 'Sofia Patel', email: 'sofia.p@example.com' },
        { name: 'Lucas Martinez', email: 'lucas.m@example.com' }
      ],
      [
        { name: 'Isabella Chen', email: 'isabella.c@example.com' },
        { name: 'Oliver Wright', email: 'oliver.w@example.com' },
        { name: 'Ava Johnson', email: 'ava.j@example.com' },
        { name: 'Ethan Brown', email: 'ethan.b@example.com' }
      ],
      [
        { name: 'Mia Garcia', email: 'mia.g@example.com' },
        { name: 'Noah Wilson', email: 'noah.w@example.com' },
        { name: 'Charlotte Lee', email: 'charlotte.l@example.com' },
        { name: 'William Davis', email: 'william.d@example.com' }
      ],
      [
        { name: 'Sophia Anderson', email: 'sophia.a@example.com' },
        { name: 'James Taylor', email: 'james.t@example.com' },
        { name: 'Amelia White', email: 'amelia.w@example.com' },
        { name: 'Benjamin Moore', email: 'ben.m@example.com' }
      ]
    ];

    for (let i = 0; i < coaches.length; i++) {
      const coach = coaches[i];
      const clients = clientGroups[i];

      for (let j = 0; j < clients.length; j++) {
        const client = clients[j];
        const template = clientTemplates[j];
        const completionRate = template.completionRate();
        const consistency = template.consistency();

        // Create client
        const clientRef = doc(clientsRef);
        const clientData = {
          id: clientRef.id,
          name: client.name,
          email: client.email,
          coachId: coach.id,
          status: 'active',
          goals: template.goals,
          preferences: {
            focusAreas: template.focusAreas,
            communicationFrequency: 'weekly'
          },
          metrics: {
            completionRate,
            consistency,
            lastCheckIn: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last week
          },
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Created 30 days ago
          updatedAt: new Date()
        };
        batch.set(clientRef, convertDatesToTimestamps(clientData));

        // Create analytics
        const analyticsRef = doc(collection(db as Firestore, 'clientAnalytics'));
        const analyticsData = {
          clientId: clientRef.id,
          submissions: Math.floor(30 * completionRate), // Based on 30 days
          averageCompletionTime: 5 + Math.random() * 10, // 5-15 minutes
          completionRate,
          consistencyScore: consistency,
          trends: {
            weight: Array.from({ length: 4 }, () => 150 + Math.random() * 10),
            energy: Array.from({ length: 4 }, () => 1 + Math.random() * 9),
            stress: Array.from({ length: 4 }, () => 1 + Math.random() * 9)
          },
          improvements: {
            weight: Math.random() * 5 - 2.5,
            energy: Math.random() * 2,
            stress: -Math.random() * 2
          },
          lastSubmission: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        };
        batch.set(analyticsRef, convertDatesToTimestamps(analyticsData));
      }
    }

    await batch.commit();
    console.log('Test data created successfully');
    return { success: true };
  } catch (error) {
    console.error('Error creating test data:', error);
    throw error;
  }
}

// Check-in functions
export const getCheckIns = async (clientId?: string, limit?: number): Promise<any[]> => {
  let filteredCheckIns = [...mockCheckIns];
  
  if (clientId) {
    filteredCheckIns = filteredCheckIns.filter(checkIn => checkIn.clientId === clientId);
  }
  
  if (limit) {
    filteredCheckIns = filteredCheckIns.slice(0, limit);
  }
  
  return filteredCheckIns;
};

// Add these new functions for role-based data access
export async function getUserData(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db as Firestore, 'users', userId));
    if (!userDoc.exists()) return null;
    
    const userData = userDoc.data();
    return {
      ...userData,
      id: userDoc.id,
      createdAt: userData.createdAt?.toDate(),
      updatedAt: userData.updatedAt?.toDate(),
    } as User;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

export async function getCoachClients(coachId: string): Promise<ClientUser[]> {
  try {
    const clientsQuery = query(
      collection(db as Firestore, 'users'),
      where('role', '==', 'client'),
      where('coachId', '==', coachId)
    );
    
    const snapshot = await getDocs(clientsQuery);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as ClientUser[];
  } catch (error) {
    console.error('Error getting coach clients:', error);
    return [];
  }
}

export async function getClientCheckIns(clientId: string, coachId?: string): Promise<CheckIn[]> {
  try {
    const checkInsQuery = query(
      collection(db as Firestore, 'checkins'),
      where('clientId', '==', clientId),
      ...(coachId ? [where('coachId', '==', coachId)] : [])
    );
    
    const snapshot = await getDocs(checkInsQuery);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      date: doc.data().date?.toDate(),
    })) as CheckIn[];
  } catch (error) {
    console.error('Error getting client check-ins:', error);
    return [];
  }
}

// Update getAllClients to use the mock data
export const getAllClients = async (): Promise<Client[]> => {
  return mockClients;
};