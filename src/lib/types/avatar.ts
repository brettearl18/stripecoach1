export const COACHING_STYLES = [
  'Nurturing & Supportive',
  'Balanced & Methodical',
  'Direct & Challenge-Driven'
] as const;
export type CoachingStyle = (typeof COACHING_STYLES)[number];

export const BUSINESS_NICHES = [
  'High Performance Athletics',
  'Weight Management & Nutrition',
  'Holistic Wellness & Mindfulness',
  'Mental Performance & Psychology',
  'Lifestyle Transformation',
  'Business & Career Coaching',
  'Relationship Coaching',
  'Personal Development',
  'Custom'
] as const;

export const GENDER_OPTIONS = [
  'Male',
  'Female',
  'Non-Binary',
  'All',
  'Other'
] as const;

export type BusinessNiche = typeof BUSINESS_NICHES[number];
export type Gender = typeof GENDER_OPTIONS[number];

export const CLIENT_TYPES = [
  'Elite Athletes',
  'Busy Professionals',
  'Wellness Enthusiasts',
  'Weight Loss Seekers',
  'Performance Optimizers',
  'Entrepreneurs',
  'Corporate Teams',
  'Students & Young Professionals'
] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];

export const APPROACH_TYPES = [
  'Data-Driven & Analytical',
  'Holistic & Integrative',
  'Motivational & Inspiring',
  'Educational & Informative',
  'Transformational & Deep Work'
] as const;
export type ApproachType = (typeof APPROACH_TYPES)[number];

export const PERSONALITY_TRAITS = [
  'Empathetic',
  'Analytical',
  'Motivating',
  'Patient',
  'Energetic',
  'Strategic',
  'Creative',
  'Structured'
] as const;
export type PersonalityTrait = (typeof PERSONALITY_TRAITS)[number];

export const COMMUNICATION_TONES = [
  'Professional & Formal',
  'Friendly & Casual',
  'Inspirational & Energetic',
  'Educational & Informative',
  'Compassionate & Understanding'
] as const;
export type CommunicationTone = (typeof COMMUNICATION_TONES)[number];

export interface BusinessAvatar {
  id: string;
  name: string;
  niches: BusinessNiche[];
  gender: Gender[];
  description: string;
  missionStatement: string;
  targetAudience: {
    clientTypes: ClientType[];
    painPoints: string[];
    goals: string[];
    demographics: string;
  };
  coachingStyle: {
    communication: CoachingStyle;
    approach: ApproachType[];
    personalityTraits: PersonalityTrait[];
    tone: CommunicationTone;
  };
  expertise: {
    specialties: string[];
    certifications: string[];
    experience: string;
  };
  branding: {
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
  formTemplates: {
    checkIn: FormTemplate;
    assessment: FormTemplate;
    progress: FormTemplate;
  };
  badges: {
    style: string;
    themes: string[];
    achievements: Achievement[];
  };
  aiPersonality: {
    basePrompt: string;
    contextualMemory: string[];
    adaptiveResponses: {
      [key: string]: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
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