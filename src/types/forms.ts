export interface FormQuestion {
  id: string;
  text: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'rating' | 'checkbox';
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  placeholder?: string;
  helpText?: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  categories: string[];
  questions: FormQuestion[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  clientId: string;
  coachId: string;
  type: 'check-in' | 'goal' | 'feedback';
  data: Record<string, any>;
  submittedAt: Date;
  status: 'pending' | 'reviewed' | 'archived';
}

export interface FormCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
}

export interface FormMetrics {
  category: string;
  score: number;
  trend: 'up' | 'down' | 'neutral';
  previousScore?: number;
  timestamp: string;
}

export interface FormAnalytics {
  totalSubmissions: number;
  completionRate: number;
  averageScore: number;
  categoryScores: {
    [key: string]: number;
  };
  recentSubmissions: FormSubmission[];
  metrics: FormMetrics[];
} 