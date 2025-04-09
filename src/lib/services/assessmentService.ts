// Mock storage for testing
const mockAssessments = new Map<string, any>();

export interface Assessment {
  physicalStats: {
    currentWeight: number;
    weightUnit: 'kg' | 'lbs';
    targetWeight: number;
  };
  lifestyle: {
    sleepQuality: number;
    energyLevel: number;
    stressLevel: number;
    dietaryRestrictions: string[];
  };
  fitness: {
    currentLevel: string;
    injuries: string;
    goals: string[];
  };
}

export async function saveAssessment(userId: string, assessment: Assessment): Promise<boolean> {
  try {
    // Store in mock storage
    mockAssessments.set(userId, {
      ...assessment,
      completedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving assessment:', error);
    return false;
  }
}

export async function getAssessment(userId: string): Promise<Assessment | null> {
  try {
    const assessment = mockAssessments.get(userId);
    return assessment || null;
  } catch (error) {
    console.error('Error getting assessment:', error);
    return null;
  }
}

export async function hasCompletedAssessment(userId: string): Promise<boolean> {
  try {
    return mockAssessments.has(userId);
  } catch (error) {
    console.error('Error checking assessment completion:', error);
    return false;
  }
}

export const DIETARY_OPTIONS = [
  'None',
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Dairy-free',
  'Keto',
  'Paleo',
  'Other'
];

export const RATING_OPTIONS = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Fair' },
  { value: 3, label: 'Good' },
  { value: 4, label: 'Very Good' },
  { value: 5, label: 'Excellent' }
];

export const FITNESS_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]; 