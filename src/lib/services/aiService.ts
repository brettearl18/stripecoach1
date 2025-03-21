import OpenAI from 'openai';
import { ClientProfile } from '@/components/checkIn/ClientProfileModal';

if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API Key. Please check your environment variables.');
}

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Enable client-side usage
});

interface Question {
  text: string;
  type: 'scale' | 'text' | 'number' | 'multiple_choice' | 'yes_no';
  required: boolean;
  options?: string[];
  priority: 'vital' | 'intermediate' | 'optional';
  category?: string;
}

export async function generateQuestions(profile: ClientProfile): Promise<Question[]> {
  try {
    const prompt = `
As a fitness coach, create a personalized check-in questionnaire based on this client profile:

Basic Information:
- Age Range: ${profile.age}
- Gender: ${profile.gender}
- Work/Life: ${profile.lifestyle}
- Training Environment: ${profile.gymAccess}

Selected Goals:
${profile.goals.map(goal => `- ${goal}`).join('\n')}

Focus Areas:
${profile.focusAreas.map(area => `- ${area}`).join('\n')}

Create a mix of 8-10 questions that:
1. Track progress towards their specific goals
2. Monitor their focus areas
3. Consider their lifestyle and training environment
4. Measure relevant metrics
5. Support habit formation

Return a JSON object with a 'questions' array. Each question should be categorized and formatted as follows:
{
  "questions": [
    {
      "text": "The question text",
      "type": "scale|text|number|multiple_choice|yes_no",
      "required": true|false,
      "options": ["option1", "option2"] (for multiple_choice only),
      "priority": "vital|intermediate|optional",
      "category": "Weight Management|Nutrition|Training|Recovery|etc"
    }
  ]
}

Ensure questions are:
1. Specific to their goals (e.g., weight loss ranges match their targets)
2. Appropriate for their training environment
3. Considerate of their lifestyle
4. Grouped by focus areas they selected
5. Mix of quantitative and qualitative measures`;

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert fitness coach who creates personalized check-in questionnaires. Return only valid JSON in the exact format specified."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-4.5-preview-2025-02-27",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const response = JSON.parse(completion.choices[0].message.content);
    
    // Ensure we have a questions array
    if (!response.questions || !Array.isArray(response.questions)) {
      throw new Error('Invalid response format from AI: missing questions array');
    }

    // Validate and transform each question
    const validatedQuestions = response.questions.map((q: any) => ({
      text: q.text || 'Untitled Question',
      type: q.type || 'text',
      required: Boolean(q.required),
      options: Array.isArray(q.options) ? q.options : undefined,
      priority: q.priority || 'intermediate',
      category: q.category || 'General'
    }));

    return validatedQuestions;
  } catch (error) {
    console.error('Error generating questions:', error);
    // Return a default set of questions if AI generation fails
    return [
      {
        text: "How many workouts did you complete this week?",
        type: "number",
        required: true,
        priority: "vital",
        category: "Training"
      },
      {
        text: "How would you rate your energy levels this week?",
        type: "scale",
        required: true,
        priority: "vital",
        category: "Wellness"
      },
      {
        text: "What challenges did you face with your fitness routine?",
        type: "text",
        required: false,
        priority: "intermediate",
        category: "General"
      }
    ];
  }
} 