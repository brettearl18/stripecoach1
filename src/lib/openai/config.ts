import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Feature Configuration
export const AI_CONFIG = {
  // Model configurations
  models: {
    summary: 'gpt-4-turbo-preview',
    feedback: 'gpt-4-turbo-preview',
    questions: 'gpt-4-turbo-preview',
    analysis: 'gpt-4-turbo-preview',
  },
  
  // Temperature settings (0-1)
  temperature: {
    summary: 0.7,
    feedback: 0.8,
    questions: 0.9,
    analysis: 0.5,
  },
  
  // Max tokens per response
  maxTokens: {
    summary: 500,
    feedback: 1000,
    questions: 800,
    analysis: 1500,
  },
  
  // System prompts for each feature
  prompts: {
    summary: `You are a professional fitness coach assistant. Summarize the client's check-in data, highlighting key progress points and areas for improvement.`,
    feedback: `You are a professional fitness coach. Generate personalized, constructive feedback based on the client's progress and goals.`,
    questions: `You are a professional fitness coach. Generate relevant, engaging questions to assess client progress and gather necessary information.`,
    analysis: `You are a professional fitness coach. Analyze the client's progress data and provide insights and recommendations.`,
  },
}; 