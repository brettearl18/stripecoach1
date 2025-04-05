import OpenAI from 'openai';
import { 
  CheckInForm, 
  CheckInMetrics, 
  AIAnalysis, 
  SentimentMetric, 
  GroupInsight 
} from '@/types/checkIn';

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  async analyzeCheckIn(checkIn: CheckInForm) {
    try {
      const prompt = `Analyze the following client check-in data and provide insights:
      Metrics: ${JSON.stringify(checkIn.metrics)}
      Answers: ${JSON.stringify(checkIn.answers)}
      Coach Feedback: ${checkIn.coachInteraction?.lastFeedback || 'None'}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an AI fitness coach assistant analyzing client check-in data." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return this.parseAIResponse(completion.choices[0].message.content || '');
    } catch (error) {
      console.error('Error analyzing check-in:', error);
      return this.getDefaultResponse();
    }
  }

  async generateGroupInsights(checkIns: CheckInForm[]) {
    try {
      const aggregatedData = this.aggregateCheckInData(checkIns);
      const prompt = `Analyze the following group fitness data and provide insights:
      ${JSON.stringify(aggregatedData)}`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an AI fitness coach assistant analyzing group performance data." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return this.parseAIResponse(completion.choices[0].message.content || '');
    } catch (error) {
      console.error('Error generating group insights:', error);
      return this.getDefaultResponse();
    }
  }

  private aggregateCheckInData(checkIns: CheckInForm[]) {
    // Aggregate metrics
    const metrics = checkIns.reduce((acc, checkIn) => {
      Object.entries(checkIn.metrics).forEach(([key, value]) => {
        if (!acc[key]) acc[key] = [];
        acc[key].push(value);
      });
      return acc;
    }, {} as Record<string, number[]>);

    // Calculate averages
    const averages = Object.entries(metrics).reduce((acc, [key, values]) => {
      acc[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalClients: checkIns.length,
      averageMetrics: averages,
      // Add more aggregated data as needed
    };
  }

  private getDefaultResponse(): AIAnalysis {
    return {
      overallMood: [
        { category: 'Energy', score: 7.8, trend: 'up' as const, change: 0.5 },
        { category: 'Motivation', score: 8.2, trend: 'up' as const, change: 0.3 },
        { category: 'Stress', score: 4.5, trend: 'down' as const, change: -0.8 },
        { category: 'Sleep Quality', score: 7.2, trend: 'stable' as const, change: 0.1 },
      ],
      recentWins: [
        "80% of clients hit their protein targets this week",
        "Average step count increased by 2,000 steps"
      ],
      commonChallenges: [
        "Weekend nutrition adherence dropping",
        "Post-work workout attendance decreased"
      ],
      insights: [
        {
          type: 'success' as const,
          message: 'Group cohesion is strengthening, with 60% more peer interactions this week',
          impact: 'high' as const
        }
      ],
      focusAreas: [
        "Schedule a group session on weekend meal prep",
        "Implement stress management techniques"
      ]
    };
  }

  private parseAIResponse(response: string): AIAnalysis {
    try {
      // For now, return the default response
      // In production, you would parse the AI response into the AIAnalysis structure
      return this.getDefaultResponse();
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getDefaultResponse();
    }
  }

  private static calculateGroupSentiment(checkIns: CheckInForm[]): SentimentMetric[] {
    const categories = ['Energy', 'Motivation', 'Stress', 'Sleep Quality'];
    
    return categories.map(category => {
      // Calculate score based on relevant metrics
      const score = this.calculateCategoryScore(category, checkIns);
      
      // Calculate trend by comparing with previous period
      const previousScore = this.calculateCategoryScore(category, checkIns, true);
      const change = score - previousScore;
      
      return {
        category,
        score,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
        change: Math.abs(change)
      };
    });
  }

  private static calculateCategoryScore(category: string, checkIns: CheckInForm[], previous = false): number {
    // Map category to relevant metrics
    const metricMappings: Record<string, (metrics: CheckInMetrics) => number> = {
      'Energy': (m) => (m.training + m.recovery) / 2,
      'Motivation': (m) => m.mindset,
      'Stress': (m) => m.stress || 50,
      'Sleep Quality': (m) => m.sleep || 50
    };

    const relevantMetrics = checkIns.map(ci => metricMappings[category](ci.metrics));
    return relevantMetrics.reduce((sum, val) => sum + val, 0) / relevantMetrics.length;
  }
} 