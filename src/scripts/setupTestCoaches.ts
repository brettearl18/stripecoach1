import { createTestCoach, createTestData } from '@/lib/services/firebaseService';
import type { Coach } from '@/types/coach';

const testCoaches: Partial<Coach>[] = [
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

export async function setupTestCoaches() {
  try {
    console.log('Starting coach setup...');
    
    // Create the coaches
    const createdCoaches = await Promise.all(
      testCoaches.map(coach => createTestCoach(coach))
    );
    
    console.log('Created coaches:', createdCoaches);

    // Create test data (clients, etc.) for each coach
    await createTestData();
    
    console.log('Test data setup complete!');
    return createdCoaches;
  } catch (error) {
    console.error('Error setting up test coaches:', error);
    throw error;
  }
} 