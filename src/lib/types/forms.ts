export type Category = 'nutrition' | 'training' | 'mindset' | 'sleep' | 'measurements' | 'custom';

export type QuestionType = 
  | 'multiple_choice'
  | 'rating_scale'
  | 'text'
  | 'photo'
  | 'number'
  | 'checkbox'
  | 'date';

export interface Question {
  id: string;
  type: QuestionType;
  category: Category;
  text: string;
  required: boolean;
  scoreEnabled: boolean;
  trackProgress: boolean;
  options?: string[]; // For multiple choice/checkbox
  minValue?: number; // For rating/number
  maxValue?: number; // For rating/number
  unit?: string; // For measurements
}

export type Frequency = 'daily' | 'weekly' | 'fortnightly' | 'monthly' | 'custom';

export interface CustomFrequency {
  type: 'custom';
  weeks: number;
}

export interface DueWindow {
  startTime: string;
  endTime: string;
  startDay?: string;
  endDay?: string;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  categories: Category[];
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Coach ID
  isTemplate: boolean; // Whether this is a pre-made template
  frequency: Frequency | CustomFrequency;
  dueWindow: DueWindow;
}

export interface CheckInResponse {
  id: string;
  clientId: string;
  formId: string;
  date: Date;
  responses: {
    questionId: string;
    value: string | number | boolean | string[]; // Different types based on question type
    photoUrl?: string;
  }[];
  scores: {
    category: Category;
    score: number;
  }[];
  overallScore: number;
  notes: string;
}

export interface ProgressReport {
  id: string;
  clientId: string;
  generatedAt: Date;
  startDate: Date;
  endDate: Date;
  categoryProgress: {
    category: Category;
    baselineScore: number;
    currentScore: number;
    improvement: number;
  }[];
  overallImprovement: number;
  beforePhotos: string[];
  afterPhotos: string[];
  aiAnalysis: string;
  recommendations: string[];
} 