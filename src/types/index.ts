// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'client';
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Coach Types
export interface Coach extends User {
  specialties: string[];
  experience: number;
  bio: string;
  rating: number;
  totalClients: number;
  activeClients: number;
}

// Client Types
export interface Client extends User {
  coachId?: string;
  goals: string[];
  progress: ClientProgress;
  subscription: Subscription;
}

// Progress Types
export interface ClientProgress {
  currentWeight: number;
  targetWeight: number;
  weeklyCheckIns: CheckIn[];
  achievements: Achievement[];
}

export interface CheckIn {
  id: string;
  date: Date;
  weight: number;
  notes: string;
  metrics: {
    calories: number;
    steps: number;
    workouts: number;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'weight' | 'fitness' | 'nutrition';
}

// Subscription Types
export interface Subscription {
  id: string;
  status: 'active' | 'cancelled' | 'past_due';
  plan: 'basic' | 'premium';
  startDate: Date;
  endDate: Date;
  paymentMethod: PaymentMethod;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
}

// Analytics Types
export interface Analytics {
  revenue: RevenueMetrics;
  clients: ClientMetrics;
  coaches: CoachMetrics;
}

export interface RevenueMetrics {
  total: number;
  monthly: number;
  growth: number;
  projections: RevenueProjection[];
}

export interface ClientMetrics {
  total: number;
  active: number;
  retention: number;
  satisfaction: number;
}

export interface CoachMetrics {
  total: number;
  active: number;
  averageRating: number;
  clientSuccess: number;
}

export interface RevenueProjection {
  date: Date;
  amount: number;
  confidence: number;
}

// Form Types
export interface FormSubmission {
  id: string;
  clientId: string;
  coachId: string;
  type: 'check-in' | 'goal' | 'feedback';
  data: Record<string, any>;
  submittedAt: Date;
  status: 'pending' | 'reviewed' | 'archived';
}

// API Route Types
export interface ApiRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  parameters?: Record<string, any>;
  response: Record<string, any>;
  auth: boolean;
} 