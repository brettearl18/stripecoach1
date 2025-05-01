import OpenAI from 'openai';
import { 
  CheckInForm, 
  CheckInMetrics, 
  AIAnalysis, 
  SentimentMetric, 
  GroupInsight,
  Question
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
      // Parse the JSON response from OpenAI
      const parsedResponse = JSON.parse(response);

      // Validate and transform the response into AIAnalysis format
      const validatedResponse: AIAnalysis = {
        overallMood: this.validateAndTransformMood(parsedResponse.overallMood || []),
        recentWins: this.validateAndTransformArray(parsedResponse.recentWins || [], 'string'),
        commonChallenges: this.validateAndTransformArray(parsedResponse.commonChallenges || [], 'string'),
        insights: this.validateAndTransformInsights(parsedResponse.insights || []),
        focusAreas: this.validateAndTransformArray(parsedResponse.focusAreas || [], 'string')
      };

      return validatedResponse;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getDefaultResponse();
    }
  }

  private validateAndTransformMood(moodData: any[]): SentimentMetric[] {
    if (!Array.isArray(moodData)) return this.getDefaultResponse().overallMood;

    return moodData.map(item => ({
      category: this.validateString(item.category) || 'Unknown',
      score: this.validateNumber(item.score) || 5,
      trend: this.validateTrend(item.trend) || 'stable',
      change: this.validateNumber(item.change) || 0
    }));
  }

  private validateAndTransformInsights(insightsData: any[]): Array<{ type: 'success' | 'warning' | 'concern'; message: string; impact: 'high' | 'medium' | 'low' }> {
    if (!Array.isArray(insightsData)) return this.getDefaultResponse().insights;

    return insightsData.map(item => ({
      type: this.validateInsightType(item.type) || 'success',
      message: this.validateString(item.message) || 'No insight available',
      impact: this.validateImpact(item.impact) || 'medium'
    }));
  }

  private validateAndTransformArray<T>(data: any[], type: 'string' | 'number'): T[] {
    if (!Array.isArray(data)) return [];

    return data.map(item => {
      if (type === 'string') {
        return this.validateString(item) as T;
      } else {
        return this.validateNumber(item) as T;
      }
    }).filter(item => item !== null);
  }

  private validateString(value: any): string | null {
    return typeof value === 'string' ? value : null;
  }

  private validateNumber(value: any): number | null {
    const num = Number(value);
    return !isNaN(num) ? num : null;
  }

  private validateTrend(value: any): 'up' | 'down' | 'stable' | null {
    return ['up', 'down', 'stable'].includes(value) ? value : null;
  }

  private validateInsightType(value: any): 'success' | 'warning' | 'concern' | null {
    return ['success', 'warning', 'concern'].includes(value) ? value : null;
  }

  private validateImpact(value: any): 'high' | 'medium' | 'low' | null {
    return ['high', 'medium', 'low'].includes(value) ? value : null;
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

  async generateQuestions(topic: string, count: number = 5): Promise<Question[]> {
    try {
      const prompt = `Generate ${count} questions about ${topic} for a fitness check-in form. 
      Each question should be clear, specific, and help assess the client's progress or challenges.
      Format the response as a JSON array of questions with the following structure:
      {
        "id": "unique_id",
        "type": "text" | "scale" | "multipleChoice" | "number" | "yesNo",
        "question": "the question text",
        "required": true | false,
        "helpText": "optional help text",
        "options": ["option1", "option2"] (for multipleChoice),
        "validation": { "min": number, "max": number } (for number or scale),
        "weight": number (1-5),
        "isNegative": true | false (if higher values indicate worse outcomes)
      }`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an AI fitness coach assistant creating check-in questions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const response = completion.choices[0].message.content || '[]';
      const questions = JSON.parse(response);

      // Validate and transform the questions
      return questions.map((q: any) => ({
        id: q.id || Math.random().toString(36).substr(2, 9),
        type: this.validateQuestionType(q.type) || 'text',
        question: this.validateString(q.question) || 'Invalid question',
        required: Boolean(q.required),
        helpText: this.validateString(q.helpText),
        options: Array.isArray(q.options) ? q.options.map(this.validateString).filter(Boolean) : undefined,
        validation: this.validateValidation(q.validation),
        weight: this.validateNumber(q.weight) || 1,
        isNegative: Boolean(q.isNegative)
      }));
    } catch (error) {
      console.error('Error generating questions:', error);
      return this.getDefaultQuestions(topic, count);
    }
  }

  private validateQuestionType(value: any): 'text' | 'scale' | 'multipleChoice' | 'number' | 'yesNo' | null {
    return ['text', 'scale', 'multipleChoice', 'number', 'yesNo'].includes(value) ? value : null;
  }

  private validateValidation(value: any): { min: number; max: number } | undefined {
    if (!value || typeof value !== 'object') return undefined;
    const min = this.validateNumber(value.min);
    const max = this.validateNumber(value.max);
    if (min === null || max === null) return undefined;
    return { min, max };
  }

  private getDefaultQuestions(topic: string, count: number): Question[] {
    return [
      {
        id: '1',
        type: 'scale',
        question: `How would you rate your ${topic} this week?`,
        required: true,
        helpText: 'Rate from 1 (poor) to 10 (excellent)',
        validation: { min: 1, max: 10 },
        weight: 3
      },
      {
        id: '2',
        type: 'text',
        question: `What were your main challenges with ${topic} this week?`,
        required: false,
        weight: 2
      },
      {
        id: '3',
        type: 'yesNo',
        question: `Did you achieve your ${topic} goals this week?`,
        required: true,
        weight: 3
      }
    ].slice(0, count);
  }
}

// Export a singleton instance
export const aiService = new AIService();

// Export the generateQuestions function directly
export const generateQuestions = (topic: string, count: number = 5) => 
  aiService.generateQuestions(topic, count); 