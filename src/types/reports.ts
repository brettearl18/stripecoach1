import { Client } from './client';

export enum ReportCategory {
  CLIENT_PROGRESS = 'CLIENT_PROGRESS',
  COACH_PERFORMANCE = 'COACH_PERFORMANCE',
  BUSINESS_METRICS = 'BUSINESS_METRICS',
  SYSTEM_HEALTH = 'SYSTEM_HEALTH'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export type ReportType = 'client-progress' | 'coach-performance' | 'compliance' | 'time-analytics' | 'nutrition' | 'business';

export interface ReportMetrics {
  weightProgress: {
    initial: number;
    current: number;
    change: number;
    percentageComplete: number;
    weeklyData: number[];
  };
  measurements: {
    changes: {
      [key: string]: {
        value: number;
        unit: string;
      };
    };
    history: {
      date: string;
      values: {
        [key: string]: number;
      };
    }[];
  };
  healthMetrics: {
    sleep: { current: number; change: number };
    energy: { current: number; change: number };
    stress: { current: number; change: number };
  };
  goals: {
    total: number;
    completed: number;
    percentage: number;
    details: {
      id: string;
      description: string;
      completed: boolean;
      completedAt?: string;
    }[];
  };
}

export interface AIAnalysis {
  overview: string;
  weightAnalysis: string;
  healthInsights: string;
  recommendations: string[];
  nextSteps: string;
  complianceScore: number;
  progressScore: number;
}

export interface Report {
  id: string;
  clientId: string;
  coachId: string;
  category: ReportCategory;
  dateRange: {
    start: string;
    end: string;
  };
  generatedAt: string;
  status: ReportStatus;
  metrics: ReportMetrics;
  aiAnalysis: AIAnalysis;
  visualData: {
    charts: {
      type: string;
      data: any;
      options?: any;
    }[];
    photos?: {
      before: string[];
      after: string[];
      comparisons: {
        beforeId: string;
        afterId: string;
        angle: string;
      }[];
    };
  };
  cache: {
    expiresAt: string;
    version: number;
  };
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  generatedBy: string;
  downloadUrl?: string;
  error?: string;
  metadata?: {
    timeRange?: {
      start: Date;
      end: Date;
    };
    filters?: Record<string, any>;
    format?: 'PDF' | 'CSV' | 'EXCEL';
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  sections: {
    id: string;
    type: 'metrics' | 'charts' | 'photos' | 'analysis' | 'custom';
    title: string;
    enabled: boolean;
    order: number;
    config?: any;
  }[];
  style: {
    theme: 'light' | 'dark';
    accentColor: string;
    fontFamily: string;
    customCSS?: string;
  };
}

export interface ReportGenerationOptions {
  templateId: string;
  dateRange: {
    start: string;
    end: string;
  };
  includeAIAnalysis: boolean;
  includePreviousComparisons: boolean;
  format: 'pdf' | 'email' | 'dashboard';
  delivery?: {
    email?: string;
    schedule?: {
      frequency: 'daily' | 'weekly' | 'monthly';
      day?: number;
      time?: string;
    };
  };
} 