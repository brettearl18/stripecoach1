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