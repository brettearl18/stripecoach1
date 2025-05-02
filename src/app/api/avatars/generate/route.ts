import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createAvatar } from '@/lib/firebase/avatars';
import { headers } from 'next/headers';

// Enhanced API key validation
function validateOpenAIKey(apiKey: string | undefined): boolean {
  if (!apiKey) return false;
  // Accept both old and new OpenAI API key formats
  // Old: sk- (51 chars), New: sk-proj- (variable, usually 48+ chars)
  if (apiKey.startsWith('sk-') && apiKey.length === 51) return true;
  if (apiKey.startsWith('sk-proj-') && apiKey.length >= 40) return true;
  return false;
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

// Rate limiting store (in-memory for now, consider using Redis in production)
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(ip);

  if (!userLimit) {
    rateLimitStore.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (now - userLimit.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (userLimit.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  userLimit.count++;
  return false;
}

// Check if OpenAI API key is configured and valid
const apiKey = process.env.OPENAI_API_KEY;
if (!validateOpenAIKey(apiKey)) {
  throw new Error('Invalid or missing OPENAI_API_KEY in environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey
});

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';

    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.niches || data.niches.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: name and niches' },
        { status: 400 }
      );
    }

    // Create a detailed prompt for OpenAI based on the form data
    const prompt = `Create a coaching avatar with the following characteristics:
Name: ${data.name}
Niches: ${data.niches.join(', ')}
Gender Focus: ${data.gender.join(', ')}
Description: ${data.description}
Mission Statement: ${data.missionStatement}
Core Values: ${data.values.join(', ')}

Target Audience:
- Client Types: ${data.clientTypes.join(', ')}
- Pain Points: ${data.painPoints.join(', ')}
- Demographics: ${data.demographics}
- Goals: ${data.goals.join(', ')}

Coaching Style:
- Communication: ${data.communicationStyle}
- Approaches: ${data.approachTypes.join(', ')}
- Personality Traits: ${data.personalityTraits ? data.personalityTraits.join(', ') : ''}
- Communication Tone: ${data.communicationTone}

Expertise:
- Specialties: ${data.specialties ? data.specialties.join(', ') : ''}
- Certifications: ${data.certifications ? data.certifications.join(', ') : ''}
- Experience: ${data.experience || ''}

Based on these inputs, generate:
1. A personalized base prompt for the avatar's interactions
2. A set of welcome messages and motivational phrases that match the tone
3. A coaching methodology framework
4. Suggested check-in questions and progress metrics
5. A color scheme that reflects the brand personality

Format the response as a JSON object with the following structure:
{
  basePrompt: string,
  welcomeMessages: string[],
  motivationalPhrases: string[],
  methodology: {
    framework: string,
    keyPrinciples: string[],
    approachDescription: string
  },
  checkInTemplate: {
    questions: { text: string, type: string }[],
    metrics: string[]
  },
  branding: {
    colors: {
      primary: string,
      secondary: string,
      accent: string
    },
    tone: {
      description: string,
      keywords: string[]
    }
  }
}`;

    try {
      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert in coaching psychology and personal development, skilled at creating detailed coaching frameworks and communication strategies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "gpt-4-turbo-preview",
        response_format: { type: "json_object" }
      });

      if (!completion.choices[0].message.content) {
        throw new Error('No response from OpenAI');
      }

      const aiResponse = JSON.parse(completion.choices[0].message.content);

      // Create the avatar in Firebase
      const avatarData = {
        ...data,
        aiPersonality: {
          basePrompt: aiResponse.basePrompt,
          contextualMemory: [],
          adaptiveResponses: {}
        },
        branding: {
          colors: aiResponse.branding.colors,
          messageStyle: {
            welcomeMessage: aiResponse.welcomeMessages[0],
            motivationalPhrases: aiResponse.motivationalPhrases,
            feedbackStyle: aiResponse.methodology.approachDescription
          },
          values: data.values
        },
        formTemplates: {
          checkIn: {
            id: 'default-checkin',
            name: 'Daily Check-in',
            description: 'Track daily progress and challenges',
            questions: aiResponse.checkInTemplate.questions
          },
          assessment: {
            id: 'default-assessment',
            name: 'Initial Assessment',
            description: 'Comprehensive client assessment',
            questions: []
          },
          progress: {
            id: 'default-progress',
            name: 'Progress Tracking',
            description: 'Track progress against goals',
            questions: []
          }
        },
        badges: {
          style: 'modern',
          themes: ['achievement', 'progress', 'milestone'],
          achievements: []
        }
      };

      const avatarId = await createAvatar(avatarData);

      return NextResponse.json({ 
        id: avatarId,
        ...aiResponse
      });
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      
      // Handle specific OpenAI errors
      if (error.code === 'invalid_api_key') {
        return NextResponse.json(
          { error: 'OpenAI API key is invalid or not configured correctly' },
          { status: 500 }
        );
      }
      
      throw error; // Re-throw other errors to be caught by outer try-catch
    }
  } catch (error) {
    console.error('Error generating avatar:', error);
    return NextResponse.json(
      { error: 'Failed to generate avatar. Please try again later.' },
      { status: 500 }
    );
  }
} 