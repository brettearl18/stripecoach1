export const COACHING_STYLES = [
  'Nurturing & Supportive',
  'Balanced & Methodical',
  'Direct & Challenge-Driven'
] as const;
export type CoachingStyle = (typeof COACHING_STYLES)[number];

export type BusinessNiche = 
  | 'Life Coaching'
  | 'Business Coaching'
  | 'Career Coaching'
  | 'Health & Wellness'
  | 'Relationship Coaching'
  | 'Leadership Coaching'
  | 'Performance Coaching'
  | 'Financial Coaching';

export type Gender = 'Male' | 'Female' | 'All';

export type ClientType =
  | 'Individuals'
  | 'Entrepreneurs'
  | 'Executives'
  | 'Teams'
  | 'Small Businesses'
  | 'Corporate';

export type ApproachType =
  | 'Data-Driven & Analytical'
  | 'Holistic & Integrative'
  | 'Motivational & Inspiring'
  | 'Educational & Informative'
  | 'Transformational & Deep Work';

export type PersonalityTrait =
  | 'Empathetic'
  | 'Direct'
  | 'Supportive'
  | 'Challenging'
  | 'Patient'
  | 'Energetic'
  | 'Structured'
  | 'Flexible';

export type CommunicationTone =
  | 'Professional & Formal'
  | 'Friendly & Casual'
  | 'Motivational & Energetic'
  | 'Calm & Supportive'
  | 'Direct & Straightforward';

export const BUSINESS_NICHES: BusinessNiche[] = [
  'Life Coaching',
  'Business Coaching',
  'Career Coaching',
  'Health & Wellness',
  'Relationship Coaching',
  'Leadership Coaching',
  'Performance Coaching',
  'Financial Coaching'
];

export const GENDER_OPTIONS: Gender[] = ['Male', 'Female', 'All'];

export const CLIENT_TYPES: ClientType[] = [
  'Individuals',
  'Entrepreneurs',
  'Executives',
  'Teams',
  'Small Businesses',
  'Corporate'
];

export const APPROACH_TYPES: ApproachType[] = [
  'Data-Driven & Analytical',
  'Holistic & Integrative',
  'Motivational & Inspiring',
  'Educational & Informative',
  'Transformational & Deep Work'
];

export const PERSONALITY_TRAITS: PersonalityTrait[] = [
  'Empathetic',
  'Direct',
  'Supportive',
  'Challenging',
  'Patient',
  'Energetic',
  'Structured',
  'Flexible'
];

export const COMMUNICATION_TONES: CommunicationTone[] = [
  'Professional & Formal',
  'Friendly & Casual',
  'Motivational & Energetic',
  'Calm & Supportive',
  'Direct & Straightforward'
];

export interface BusinessAvatar {
  id?: string;
  name: string;
  niches: BusinessNiche[];
  gender: Gender[];
  description: string;
  missionStatement: string;
  values: string[];
  clientTypes: ClientType[];
  painPoints: string[];
  demographics: string;
  goals: string[];
  communicationStyle: string;
  approachTypes: ApproachType[];
  personalityTraits: PersonalityTrait[];
  communicationTone: CommunicationTone;
  specialties: string[];
  certifications: string[];
  experience: string;
  aiPersonality?: {
    basePrompt: string;
    contextualMemory: any[];
    adaptiveResponses: Record<string, any>;
  };
  branding?: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    messageStyle: {
      welcomeMessage: string;
      motivationalPhrases: string[];
      feedbackStyle: string;
    };
    values: string[];
  };
  formTemplates?: {
    checkIn: {
      id: string;
      name: string;
      description: string;
      questions: Array<{
        text: string;
        type: string;
      }>;
    };
    assessment: {
      id: string;
      name: string;
      description: string;
      questions: any[];
    };
    progress: {
      id: string;
      name: string;
      description: string;
      questions: any[];
    };
  };
  badges?: {
    style: string;
    themes: string[];
    achievements: any[];
  };
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  questions: {
    text: string;
    type: string;
    metrics: string[];
    required: boolean;
    options?: string[];
  }[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: {
    metric: string;
    threshold: number;
    timeframe?: string;
  };
  rewards?: {
    points: number;
    badge?: string;
    perks?: string[];
  };
}

export type { BusinessAvatar, FormTemplate, Achievement }; 