export type QuestionType = 'number' | 'text' | 'select' | 'multiselect' | 'range' | 'boolean';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface RangeConfig {
  min: number;
  max: number;
  step: number;
  minLabel: string;
  maxLabel: string;
  middleLabel?: string;
}

export interface OnboardingQuestion {
  id: string;
  sectionId: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  options?: QuestionOption[];
  rangeConfig?: RangeConfig;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
}

export interface OnboardingSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  questions: OnboardingQuestion[];
}

export interface OnboardingConfig {
  id: string;
  coachId: string;
  title: string;
  description: string;
  sections: OnboardingSection[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface OnboardingResponse {
  id: string;
  userId: string;
  configId: string;
  responses: {
    questionId: string;
    value: any;
  }[];
  completedAt: Date;
} 