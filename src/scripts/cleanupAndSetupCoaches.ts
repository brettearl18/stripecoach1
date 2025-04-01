import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { db } from '@/lib/firebase/config';
import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { createTestCoach } from '@/lib/services/firebaseService';

async function cleanupExistingCoaches() {
  console.log('Starting coach cleanup...');
  try {
    const coachesRef = collection(db, 'coaches');
    const querySnapshot = await getDocs(coachesRef);
    
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
      console.log(`Deleting coach: ${doc.id}`);
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Deleted ${querySnapshot.size} coaches`);
  } catch (error) {
    console.error('Error cleaning up coaches:', error);
    throw error;
  }
}

async function setupNewCoaches() {
  console.log('Setting up new test coaches...');
  try {
    const testCoaches = [
      {
        name: 'Dr. Sarah Mitchell',
        email: 'sarah.mitchell@stripecoach.com',
        specialties: ['Weight Management', 'Nutrition Science', 'Metabolic Health'],
        experience: '12 years',
        bio: 'Ph.D. in Nutritional Sciences with focus on metabolic health. Former research scientist turned health coach.'
      },
      {
        name: 'James Anderson',
        email: 'james.anderson@stripecoach.com',
        specialties: ['Strength Training', 'Athletic Performance', 'Injury Prevention'],
        experience: '15 years',
        bio: 'Former Olympic athlete and certified strength & conditioning specialist. Specializes in athletic performance.'
      },
      {
        name: 'Dr. Emily Wong',
        email: 'emily.wong@stripecoach.com',
        specialties: ['Mental Health', 'Stress Management', 'Corporate Wellness'],
        experience: '10 years',
        bio: 'Clinical psychologist with expertise in workplace wellness and stress management. Certified mindfulness instructor.'
      },
      {
        name: 'Marcus Rodriguez',
        email: 'marcus.rodriguez@stripecoach.com',
        specialties: ['Functional Fitness', 'Lifestyle Transformation', 'Habit Formation'],
        experience: '8 years',
        bio: 'Behavioral change specialist and certified health coach. Focus on sustainable lifestyle transformations.'
      }
    ];

    const coaches = await Promise.all(
      testCoaches.map(coach => createTestCoach(coach))
    );

    console.log(`Created ${coaches.length} new test coaches`);
    return coaches;
  } catch (error) {
    console.error('Error setting up new coaches:', error);
    throw error;
  }
}

export async function cleanupAndSetupCoaches() {
  try {
    await cleanupExistingCoaches();
    const newCoaches = await setupNewCoaches();
    console.log('Coach cleanup and setup completed successfully');
    return newCoaches;
  } catch (error) {
    console.error('Error in cleanup and setup process:', error);
    throw error;
  }
}

// Execute if running directly
if (require.main === module) {
  cleanupAndSetupCoaches()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
} 