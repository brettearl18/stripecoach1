import { FormTemplate, Category, QuestionType } from '../types/forms';

export const defaultTemplates: FormTemplate[] = [
  {
    id: 'weekly-check-in',
    name: 'Weekly Check-in Template',
    description: 'Comprehensive weekly check-in form covering all aspects of client progress',
    categories: ['nutrition', 'training', 'mindset', 'sleep', 'measurements'],
    questions: [
      // Nutrition Questions
      {
        id: 'nutrition-adherence',
        type: 'rating_scale',
        category: 'nutrition',
        text: 'How well did you stick to your nutrition plan this week?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 10
      },
      {
        id: 'nutrition-challenges',
        type: 'text',
        category: 'nutrition',
        text: 'What were your biggest nutrition challenges this week?',
        required: true,
        scoreEnabled: false,
        trackProgress: false
      },
      {
        id: 'meal-prep',
        type: 'checkbox',
        category: 'nutrition',
        text: 'Which meals did you prepare in advance?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        options: ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
      },

      // Training Questions
      {
        id: 'workouts-completed',
        type: 'number',
        category: 'training',
        text: 'How many workouts did you complete this week?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 0,
        maxValue: 7
      },
      {
        id: 'training-intensity',
        type: 'rating_scale',
        category: 'training',
        text: 'Rate your overall training intensity this week',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 10
      },
      {
        id: 'progress-photos',
        type: 'photo',
        category: 'training',
        text: 'Upload your progress photos',
        required: true,
        scoreEnabled: false,
        trackProgress: true
      },

      // Mindset Questions
      {
        id: 'stress-level',
        type: 'rating_scale',
        category: 'mindset',
        text: 'Rate your stress level this week',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 10
      },
      {
        id: 'motivation',
        type: 'rating_scale',
        category: 'mindset',
        text: 'How motivated do you feel about your progress?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 10
      },

      // Sleep Questions
      {
        id: 'sleep-quality',
        type: 'rating_scale',
        category: 'sleep',
        text: 'Rate your overall sleep quality this week',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 10
      },
      {
        id: 'sleep-hours',
        type: 'number',
        category: 'sleep',
        text: 'Average hours of sleep per night',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 0,
        maxValue: 12
      },

      // Measurements
      {
        id: 'weight',
        type: 'number',
        category: 'measurements',
        text: 'Current weight',
        required: true,
        scoreEnabled: false,
        trackProgress: true,
        unit: 'kg'
      },
      {
        id: 'waist',
        type: 'number',
        category: 'measurements',
        text: 'Waist measurement',
        required: true,
        scoreEnabled: false,
        trackProgress: true,
        unit: 'cm'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    isTemplate: true
  }
];

export const getTemplateById = (id: string): FormTemplate | undefined => {
  return defaultTemplates.find(template => template.id === id);
}; 