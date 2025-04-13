import OpenAI from 'openai';
import { 
  CheckInForm, 
  CheckInMetrics, 
  AIAnalysis, 
  SentimentMetric, 
  GroupInsight 
} from '@/types/checkIn';
import { ClientProfile } from '@/components/checkIn/ClientProfileModal';

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

// Mock AI service for development
export async function generateQuestions(clientProfile: ClientProfile): Promise<any[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Generate questions based on client profile
  const questions = [
    {
      text: 'How would you rate your energy levels today?',
      type: 'scale',
      required: true,
      priority: 'vital',
      category: 'Wellness',
      subcategories: ['Energy Levels']
    },
    {
      text: 'Did you follow your meal plan today?',
      type: 'yes_no',
      required: true,
      priority: 'vital',
      category: 'Nutrition',
      subcategories: ['Meal Planning']
    },
    {
      text: 'How many hours of sleep did you get last night?',
      type: 'number',
      required: true,
      priority: 'vital',
      category: 'Sleep',
      subcategories: ['Duration']
    },
    {
      text: 'What challenges did you face with your workouts this week?',
      type: 'text',
      required: false,
      priority: 'intermediate',
      category: 'Training',
      subcategories: ['Form', 'Strength']
    },
    {
      text: 'Which areas of nutrition do you need help with?',
      type: 'multiple_choice',
      required: true,
      priority: 'intermediate',
      category: 'Nutrition',
      options: ['Meal Planning', 'Portion Control', 'Protein Intake', 'Hydration'],
      subcategories: ['Meal Planning', 'Macros']
    }
  ];

  // Filter and customize questions based on client profile
  if (clientProfile.goals?.includes('Weight Loss')) {
    questions.push({
      text: 'How well did you stick to your calorie target today?',
      type: 'scale',
      required: true,
      priority: 'vital',
      category: 'Weight Management',
      subcategories: ['Weight Loss']
    });
  }

  if (clientProfile.goals?.includes('Muscle Gain')) {
    questions.push({
      text: 'Did you hit your protein target today?',
      type: 'yes_no',
      required: true,
      priority: 'vital',
      category: 'Nutrition',
      subcategories: ['Macros']
    });
  }

  if (clientProfile.challenges?.includes('Stress')) {
    questions.push({
      text: 'How would you rate your stress levels today?',
      type: 'scale',
      required: true,
      priority: 'vital',
      category: 'Mental Health',
      subcategories: ['Stress']
    });
  }

  return questions;
} 