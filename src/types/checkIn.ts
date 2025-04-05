export type QuestionType = 'text' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'rating';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

export interface CheckInTemplate {
  id: string;
  coachId: string;
  title: string;
  description: string;
  questions: Question[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInMetrics {
  training: number;
  nutrition: number;
  mindset: number;
  recovery?: number;
  sleep?: number;
  stress?: number;
}

export interface CheckInStatus {
  state: 'pending' | 'completed' | 'reviewed';
  clientProgress: 'on_track' | 'needs_attention' | 'at_risk';
  lastUpdated: string;
}

export interface CheckInPhoto {
  id: string;
  url: string;
  type: 'progress' | 'form' | 'nutrition';
  date: string;
  notes?: string;
}

export interface CheckInForm {
  id: string;
  templateId: string;
  clientId: string;
  title: string;
  description: string;
  questions: Question[];
  answers: CheckInAnswer[];
  metrics: CheckInMetrics;
  status: CheckInStatus;
  photos?: CheckInPhoto[];
  dueDate: string;
  completedAt?: string;
  coachFeedback?: {
    comment: string;
    suggestions: string[];
    rating?: number;
    reviewedAt: string;
  };
  aiInsights?: {
    summary: string;
    recommendations: string[];
    trends: {
      metric: keyof CheckInMetrics;
      trend: 'up' | 'down' | 'stable';
      change: number;
    }[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface CheckInAnswer {
  questionId: string;
  value: string | number | boolean | string[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckInStreak {
  current: number;
  longest: number;
  lastCheckIn: string;
  consistency: number; // Percentage of completed check-ins
}

export interface CheckInHistory {
  lastFiveCheckIns: {
    id: string;
    date: string;
    overallScore: number;
    metrics: CheckInMetrics;
  }[];
  trends: {
    metric: keyof CheckInMetrics;
    weeklyAverage: number;
    monthlyAverage: number;
    trend: 'up' | 'down' | 'stable';
  }[];
}

export interface CoachInteraction {
  lastReview: string;
  averageResponseTime: number;
  totalReviews: number;
  lastFeedback?: {
    date: string;
    summary: string;
    action_items: string[];
  };
}

export interface EnhancedCheckInForm extends CheckInForm {
  streak: CheckInStreak;
  history: CheckInHistory;
  coachInteraction: CoachInteraction;
  engagement: {
    photoSubmissions: number;
    commentResponses: number;
    actionItemsCompleted: number;
    totalActionItems: number;
  };
}

export interface CoachDashboardMetrics {
  dailyMetrics: {
    totalCheckIns: number;
    pendingReviews: number;
    completedReviews: number;
    averageResponseTime: number;
  };
  clientMetrics: {
    totalActive: number;
    atRisk: number;
    improving: number;
    needsAttention: number;
  };
  engagementMetrics: {
    weeklyActiveClients: number;
    averageCheckInCompletion: number;
    photoSubmissionRate: number;
    feedbackResponseRate: number;
  };
  priorityActions: {
    urgentReviews: string[]; // Check-in IDs
    atRiskClients: string[]; // Client IDs
    pendingPhotos: string[]; // Check-in IDs
    missedCheckIns: string[]; // Client IDs
  };
} 