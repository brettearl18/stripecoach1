import { z } from 'zod';
import { 
  Coach, 
  Client, 
  CheckIn, 
  FormSubmission,
  ClientProgress,
  Subscription
} from '../../types';

// Zod schemas for runtime validation
export const coachSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.literal('coach'),
  name: z.string(),
  specialties: z.array(z.string()),
  experience: z.number().min(0),
  bio: z.string(),
  rating: z.number().min(0).max(5),
  totalClients: z.number().min(0),
  activeClients: z.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const clientSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.literal('client'),
  name: z.string(),
  coachId: z.string().optional(),
  goals: z.array(z.string()),
  progress: z.object({
    currentWeight: z.number(),
    targetWeight: z.number(),
    weeklyCheckIns: z.array(z.object({
      id: z.string(),
      date: z.date(),
      weight: z.number(),
      notes: z.string(),
      metrics: z.object({
        calories: z.number(),
        steps: z.number(),
        workouts: z.number()
      })
    })),
    achievements: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      date: z.date(),
      type: z.enum(['weight', 'fitness', 'nutrition'])
    }))
  }),
  subscription: z.object({
    id: z.string(),
    status: z.enum(['active', 'cancelled', 'past_due']),
    plan: z.enum(['basic', 'premium']),
    startDate: z.date(),
    endDate: z.date(),
    paymentMethod: z.object({
      id: z.string(),
      type: z.enum(['card', 'bank']),
      last4: z.string(),
      expiryMonth: z.number().optional(),
      expiryYear: z.number().optional()
    })
  }),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const checkInSchema = z.object({
  id: z.string(),
  date: z.date(),
  weight: z.number(),
  notes: z.string(),
  metrics: z.object({
    calories: z.number(),
    steps: z.number(),
    workouts: z.number()
  })
});

export const formSubmissionSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  coachId: z.string(),
  type: z.enum(['check-in', 'goal', 'feedback']),
  data: z.record(z.any()),
  submittedAt: z.date(),
  status: z.enum(['pending', 'reviewed', 'archived'])
});

// Validation functions
export const validateCoach = (data: unknown): Coach => {
  return coachSchema.parse(data);
};

export const validateClient = (data: unknown): Client => {
  return clientSchema.parse(data);
};

export const validateCheckIn = (data: unknown): CheckIn => {
  return checkInSchema.parse(data);
};

export const validateFormSubmission = (data: unknown): FormSubmission => {
  return formSubmissionSchema.parse(data);
};

// Data transformation utilities
export const transformDates = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(transformDates);
  }
  if (data && typeof data === 'object') {
    const transformed: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (key.toLowerCase().includes('date') || key.toLowerCase().includes('at')) {
        transformed[key] = new Date(value as string);
      } else {
        transformed[key] = transformDates(value);
      }
    }
    return transformed;
  }
  return data;
};

// Error handling
export class ValidationError extends Error {
  constructor(message: string, public errors: any[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Type guards
export const isCoach = (data: unknown): data is Coach => {
  return coachSchema.safeParse(data).success;
};

export const isClient = (data: unknown): data is Client => {
  return clientSchema.safeParse(data).success;
};

export const isCheckIn = (data: unknown): data is CheckIn => {
  return checkInSchema.safeParse(data).success;
};

export const isFormSubmission = (data: unknown): data is FormSubmission => {
  return formSubmissionSchema.safeParse(data).success;
}; 