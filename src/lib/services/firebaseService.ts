import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  query,
  where,
  Timestamp,
  writeBatch
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

export interface Coach {
  id?: string;
  name: string;
  email: string;
  specialties: string[];
  experience: string;
  bio: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Client {
  id?: string;
  name: string;
  email: string;
  coachId: string;
  status: 'active' | 'inactive';
  goals: string[];
  preferences: {
    focusAreas: string[];
    communicationFrequency: string;
  };
  metrics: {
    completionRate: number;
    consistency: number;
    lastCheckIn: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export async function createTestCoach(coachData: Partial<Coach>): Promise<Coach> {
  try {
    const coachRef = collection(db, 'coaches');
    const coach: Coach = {
      name: coachData.name || '',
      email: coachData.email || '',
      specialties: coachData.specialties || [],
      experience: coachData.experience || '',
      bio: coachData.bio || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(coachRef, convertDatesToTimestamps(coach));
    return { ...coach, id: docRef.id };
  } catch (error) {
    console.error('Error creating test coach:', error);
    throw error;
  }
}

export async function getCoaches(): Promise<Coach[]> {
  try {
    const coachesRef = collection(db, 'coaches');
    const querySnapshot = await getDocs(coachesRef);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...convertTimestampsToDates(data),
        specialties: Array.isArray(data.specialties) ? data.specialties : []
      } as Coach;
    });
  } catch (error) {
    console.error('Error getting coaches:', error);
    throw error;
  }
}

export async function getClientsByCoach(coachId: string): Promise<Client[]> {
  try {
    const clientsRef = collection(db, 'clients');
    const q = query(clientsRef, where('coachId', '==', coachId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestampsToDates(doc.data())
    } as Client));
  } catch (error) {
    console.error('Error getting clients:', error);
    throw error;
  }
}

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