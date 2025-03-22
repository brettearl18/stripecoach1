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
  templateId: string;
  userId: string;
  answers: {
    questionId: string;
    value: string | number | string[] | boolean;
  }[];
  status: 'draft' | 'submitted';
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
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