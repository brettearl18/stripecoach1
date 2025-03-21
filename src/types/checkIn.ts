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

export interface CheckInForm {
  id: string;
  templateId: string;
  clientId: string;
  title: string;
  description: string;
  questions: Question[];
  answers: CheckInAnswer[];
  status: 'pending' | 'completed';
  dueDate: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInAnswer {
  questionId: string;
  value: string | number | boolean | string[];
  createdAt: string;
  updatedAt: string;
} 