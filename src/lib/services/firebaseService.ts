import { db } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  Timestamp,
  writeBatch,
  getDoc
} from 'firebase/firestore';

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
    name: 'John Doe',
    email: 'john@example.com',
    coachId: '1',
    goals: ['Weight Loss', 'Muscle Gain'],
    lastLoginAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    lastCheckIn: new Date(Date.now() - 48 * 60 * 60 * 1000),
    isActive: true
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    coachId: '2',
    goals: ['Stress Reduction', 'Work-Life Balance'],
    lastLoginAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    lastCheckIn: new Date(Date.now() - 96 * 60 * 60 * 1000),
    isActive: true
  }
];

// Coach functions
export const getCoaches = async (): Promise<Coach[]> => {
  return mockCoaches;
};

export const getCoach = async (id: string): Promise<Coach | null> => {
  try {
    const coachRef = doc(db, 'coaches', id);
    const coachDoc = await getDoc(coachRef);
    
    if (!coachDoc.exists()) {
      return null;
    }

    const coachData = coachDoc.data();
    return {
      id: coachDoc.id,
      ...convertTimestampsToDates(coachData)
    } as Coach;
  } catch (error) {
    console.error('Error getting coach:', error);
    return null;
  }
};

export const createTestCoach = async (coachData: Omit<Coach, 'id'>): Promise<Coach> => {
  const newCoach: Coach = {
    ...coachData,
    id: String(mockCoaches.length + 1),
    lastLoginAt: new Date()
  };
  mockCoaches.push(newCoach);
  return newCoach;
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

export async function createTestData() {
  try {
    const batch = writeBatch(db);
    const clientsRef = collection(db, 'clients');
    const analyticsRef = collection(db, 'clientAnalytics');

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
        const analyticsRef = doc(collection(db, 'clientAnalytics'));
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