export interface AIInsight {
  overallScore: number;
  summary: string;
  wins: string[];
  struggles: string[];
  recommendations: string[];
  keyMetrics: {
    adherence: number;
    progress: number;
    consistency: number;
    engagement: number;
  };
  priorityLevel: 'high' | 'medium' | 'low';
}

export interface CheckInWithAI extends CheckIn {
  aiInsights: AIInsight;
} 