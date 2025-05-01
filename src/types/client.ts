export type ClientStatus = 'active' | 'pending' | 'paused' | 'completed';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type CommunicationPreference = 'email' | 'sms' | 'whatsapp';

export interface ClientMeasurements {
  weight?: number;
  height?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  measurementUnit: 'metric' | 'imperial';
}

export interface ClientGoals {
  primary: string;
  secondary?: string;
  targetWeight?: number;
  targetBodyFat?: number;
  timeline?: number; // in weeks
}

export interface ClientAvailability {
  timezone: string;
  preferredCheckInDay: string;
  preferredCheckInTime?: string;
  availableForCalls: {
    [key: string]: { // day of week
      start: string;
      end: string;
    }[];
  };
}

export interface ClientCommunication {
  email: string;
  phone?: string;
  preferences: CommunicationPreference[];
  notificationSettings: {
    checkInReminders: boolean;
    progressUpdates: boolean;
    messageAlerts: boolean;
  };
}

export interface ClientProgram {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  type: string;
  phase: string;
  weekInProgram: number;
  totalWeeks: number;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  status: ClientStatus;
  fitnessLevel: FitnessLevel;
  joinDate: string;
  communication: ClientCommunication;
  program: ClientProgram;
  measurements: ClientMeasurements;
  goals: ClientGoals;
  availability: ClientAvailability;
  notes?: string;
  photos?: {
    url: string;
    date: string;
    type: 'front' | 'side' | 'back';
  }[];
  documents?: {
    url: string;
    name: string;
    type: string;
    uploadDate: string;
  }[];
  lastCheckIn?: string;
  nextCheckIn?: string;
  complianceRate?: number;
  progressRate?: number;
}

export interface ClientProfile {
  id: string;
  coachId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  startDate: string;
  notes: string;
  status: 'pending' | 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
  
  // Profile specific fields
  metrics?: {
    checkIns: number;
    totalSessions: number;
    consistency: number;
    daysStreak: number;
    lastCheckIn?: Date;
    completionRate: number;
  };
  
  // Coaching specific fields
  program?: {
    type?: string;
    currentWeek: number;
    totalWeeks: number;
    phase: string;
  };
  
  // Forms and check-ins
  assignedForms?: {
    id: string;
    title: string;
    type: 'check-in' | 'assessment' | 'questionnaire';
    dueDate?: Date;
    status: 'pending' | 'completed';
  }[];
  
  // Goals and progress
  goals?: string[];
  progressNotes?: {
    date: Date;
    note: string;
    author: string;
  }[];
}

export interface ClientInvite {
  id: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  clientProfile: ClientProfile;
} 