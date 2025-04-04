import { User } from './user';

export type FeedbackCategory = 'training' | 'nutrition' | 'mindset';
export type FeedbackStatus = 'pending' | 'reviewed' | 'completed';

export interface AudioMessage {
  id: string;
  url: string;
  duration: number;
  createdAt: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
}

export interface FeedbackMetric {
  name: string;
  change: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface ClientFeedbackResponse {
  id: string;
  feedbackId: string;
  clientId: string;
  content?: string;
  audioMessage?: AudioMessage;
  attachments?: FileAttachment[];
  isAgreed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoachFeedback {
  id: string;
  clientId: string;
  coachId: string;
  category: FeedbackCategory;
  title: string;
  content: string;
  metric?: FeedbackMetric;
  suggestions: string[];
  audioMessages: AudioMessage[];
  attachments: FileAttachment[];
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
  responses?: ClientFeedbackResponse[];
}

export interface FeedbackAnalytics {
  totalFeedbacks: number;
  responseRate: number;
  agreementRate: number;
  averageResponseTime: number;
  categoryBreakdown: {
    [key in FeedbackCategory]: number;
  };
  audioUsage: {
    coach: number;
    client: number;
  };
  attachmentUsage: {
    coach: number;
    client: number;
  };
} 