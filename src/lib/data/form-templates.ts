import { FormTemplate, Category, QuestionType } from '../types/forms';

export const defaultTemplates: FormTemplate[] = [
  {
    id: 'quick-daily-checkin',
    name: 'Quick Daily Check-in',
    description: 'A brief daily check-in to track essential metrics and habits',
    categories: ['nutrition', 'energy', 'sleep', 'stress'],
    questions: [
      {
        id: 'daily-water',
        type: 'number',
        category: 'nutrition',
        text: 'How many liters of water did you drink today?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 0,
        maxValue: 10
      },
      {
        id: 'daily-meals',
        type: 'number',
        category: 'nutrition',
        text: 'How many meals did you eat today?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 0,
        maxValue: 10
      },
      {
        id: 'daily-energy',
        type: 'rating_scale',
        category: 'energy',
        text: 'How would you rate your energy levels today?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 5
      },
      {
        id: 'daily-sleep-hours',
        type: 'number',
        category: 'sleep',
        text: 'How many hours of sleep did you get last night?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 0,
        maxValue: 12
      },
      {
        id: 'daily-sleep-quality',
        type: 'rating_scale',
        category: 'sleep',
        text: 'Rate your sleep quality',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 5
      },
      {
        id: 'daily-stress',
        type: 'rating_scale',
        category: 'stress',
        text: 'Rate your stress level today',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 5
      },
      {
        id: 'daily-mood',
        type: 'rating_scale',
        category: 'stress',
        text: 'How would you rate your overall mood today?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 5
      },
      {
        id: 'daily-workout',
        type: 'checkbox',
        category: 'training',
        text: 'Did you complete your planned workout today?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        options: ['Yes', 'No']
      },
      {
        id: 'daily-nutrition-adherence',
        type: 'rating_scale',
        category: 'nutrition',
        text: 'How well did you stick to your nutrition plan today?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 5
      },
      {
        id: 'daily-win',
        type: 'text',
        category: 'goals',
        text: 'What was your biggest win today?',
        required: false,
        scoreEnabled: false,
        trackProgress: false
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    isTemplate: true
  },
  {
    id: 'weekly-progress-review',
    name: 'Weekly Progress Review',
    description: 'Comprehensive weekly review of progress across all areas',
    categories: ['goals', 'training', 'nutrition', 'recovery'],
    questions: [
      {
        id: 'weekly-workouts',
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
        id: 'weekly-intensity',
        type: 'rating_scale',
        category: 'training',
        text: 'Rate your overall training intensity this week',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 5
      },
      {
        id: 'weekly-nutrition',
        type: 'rating_scale',
        category: 'nutrition',
        text: 'How well did you stick to your nutrition plan this week?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 5
      },
      {
        id: 'weekly-meal-prep',
        type: 'checkbox',
        category: 'nutrition',
        text: 'Which meals did you prepare in advance this week?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        options: ['Breakfast', 'Lunch', 'Dinner', 'Snacks']
      },
      {
        id: 'weekly-recovery',
        type: 'multiselect',
        category: 'recovery',
        text: 'What recovery methods did you use this week?',
        required: true,
        scoreEnabled: false,
        trackProgress: true,
        options: ['Stretching', 'Foam Rolling', 'Massage', 'Ice/Heat', 'Rest']
      },
      {
        id: 'weekly-sleep-avg',
        type: 'number',
        category: 'recovery',
        text: 'What was your average hours of sleep per night?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 0,
        maxValue: 12
      },
      {
        id: 'weekly-challenges',
        type: 'text',
        category: 'goals',
        text: 'What were your biggest challenges this week?',
        required: true,
        scoreEnabled: false,
        trackProgress: false
      },
      {
        id: 'weekly-wins',
        type: 'text',
        category: 'goals',
        text: 'What were your biggest wins this week?',
        required: true,
        scoreEnabled: false,
        trackProgress: false
      },
      {
        id: 'weekly-goals-progress',
        type: 'rating_scale',
        category: 'goals',
        text: 'Rate your progress towards your goals this week',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 5
      },
      {
        id: 'weekly-next-focus',
        type: 'text',
        category: 'goals',
        text: 'What will you focus on improving next week?',
        required: true,
        scoreEnabled: false,
        trackProgress: false
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    isTemplate: true
  },
  {
    id: 'monthly-measurements',
    name: 'Monthly Measurements',
    description: 'Detailed monthly tracking of body measurements and progress photos',
    categories: ['measurements', 'goals', 'progress'],
    questions: [
      {
        id: 'monthly-weight',
        type: 'number',
        category: 'measurements',
        text: 'Current weight (in kg)',
        required: true,
        scoreEnabled: false,
        trackProgress: true,
        unit: 'kg'
      },
      {
        id: 'monthly-waist',
        type: 'number',
        category: 'measurements',
        text: 'Waist measurement (in cm)',
        required: true,
        scoreEnabled: false,
        trackProgress: true,
        unit: 'cm'
      },
      {
        id: 'monthly-hips',
        type: 'number',
        category: 'measurements',
        text: 'Hip measurement (in cm)',
        required: true,
        scoreEnabled: false,
        trackProgress: true,
        unit: 'cm'
      },
      {
        id: 'monthly-chest',
        type: 'number',
        category: 'measurements',
        text: 'Chest measurement (in cm)',
        required: true,
        scoreEnabled: false,
        trackProgress: true,
        unit: 'cm'
      },
      {
        id: 'monthly-arms',
        type: 'number',
        category: 'measurements',
        text: 'Upper arm measurement (in cm)',
        required: true,
        scoreEnabled: false,
        trackProgress: true,
        unit: 'cm'
      },
      {
        id: 'monthly-thighs',
        type: 'number',
        category: 'measurements',
        text: 'Thigh measurement (in cm)',
        required: true,
        scoreEnabled: false,
        trackProgress: true,
        unit: 'cm'
      },
      {
        id: 'monthly-photos',
        type: 'photo',
        category: 'progress',
        text: 'Upload your progress photos (front, side, back)',
        required: true,
        scoreEnabled: false,
        trackProgress: true
      },
      {
        id: 'monthly-clothes-fit',
        type: 'rating_scale',
        category: 'progress',
        text: 'How would you rate how your clothes are fitting?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 5
      },
      {
        id: 'monthly-satisfaction',
        type: 'rating_scale',
        category: 'goals',
        text: 'How satisfied are you with your progress this month?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 5
      },
      {
        id: 'monthly-goals-update',
        type: 'text',
        category: 'goals',
        text: 'Would you like to update any of your goals for next month?',
        required: false,
        scoreEnabled: false,
        trackProgress: false
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    isTemplate: true
  },
  {
    id: 'nutrition-deep-dive',
    name: 'Nutrition Deep Dive',
    description: 'Detailed assessment of nutrition habits and patterns',
    categories: ['nutrition', 'habits', 'goals'],
    questions: [
      {
        id: 'nutrition-meals-count',
        type: 'number',
        category: 'nutrition',
        text: 'How many meals do you typically eat per day?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 10
      },
      {
        id: 'nutrition-protein',
        type: 'rating_scale',
        category: 'nutrition',
        text: 'How consistently are you hitting your protein targets?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 5
      },
      {
        id: 'nutrition-vegetables',
        type: 'number',
        category: 'nutrition',
        text: 'How many servings of vegetables do you eat daily?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 0,
        maxValue: 20
      },
      {
        id: 'nutrition-water',
        type: 'number',
        category: 'nutrition',
        text: 'How many liters of water do you drink daily?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 0,
        maxValue: 10
      },
      {
        id: 'nutrition-cravings',
        type: 'multiselect',
        category: 'nutrition',
        text: 'What foods do you typically crave?',
        required: true,
        scoreEnabled: false,
        trackProgress: true,
        options: ['Sweets', 'Salty Snacks', 'Fast Food', 'Carbs', 'None']
      },
      {
        id: 'nutrition-triggers',
        type: 'multiselect',
        category: 'habits',
        text: 'What typically triggers unplanned eating?',
        required: true,
        scoreEnabled: false,
        trackProgress: true,
        options: ['Stress', 'Boredom', 'Social Events', 'Emotions', 'None']
      },
      {
        id: 'nutrition-prep',
        type: 'rating_scale',
        category: 'habits',
        text: 'How well are you keeping up with meal preparation?',
        required: true,
        scoreEnabled: true,
        trackProgress: true,
        minValue: 1,
        maxValue: 5
      },
      {
        id: 'nutrition-challenges',
        type: 'text',
        category: 'goals',
        text: 'What are your biggest nutrition challenges?',
        required: true,
        scoreEnabled: false,
        trackProgress: false
      },
      {
        id: 'nutrition-wins',
        type: 'text',
        category: 'goals',
        text: 'What are your recent nutrition wins?',
        required: true,
        scoreEnabled: false,
        trackProgress: false
      },
      {
        id: 'nutrition-goals',
        type: 'text',
        category: 'goals',
        text: 'What nutrition habits would you like to improve?',
        required: true,
        scoreEnabled: false,
        trackProgress: false
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    isTemplate: true
  },
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

export const defaultCheckInTemplate: FormTemplate = {
  id: 'default-check-in',
  name: 'Weekly Check-in',
  description: 'Track your progress across different areas of your fitness journey',
  categories: [
    {
      id: 'nutrition',
      name: 'Nutrition',
      description: 'Track your eating habits and nutrition goals',
      icon: '🍽️',
      color: 'green',
    },
    {
      id: 'training',
      name: 'Training',
      description: 'Monitor your workout consistency and intensity',
      icon: '💪',
      color: 'blue',
    },
    {
      id: 'mindset',
      name: 'Mindset',
      description: 'Assess your mental state and motivation',
      icon: '🧠',
      color: 'purple',
    },
    {
      id: 'recovery',
      name: 'Recovery',
      description: 'Track your sleep and recovery habits',
      icon: '😴',
      color: 'orange',
    },
  ],
  questions: [
    // Nutrition Questions
    {
      id: 'nutrition-1',
      text: 'How would you rate your meal preparation this week?',
      type: 'rating',
      required: true,
      categoryId: 'nutrition',
      helpText: 'Consider how well you stuck to your meal plan',
    },
    {
      id: 'nutrition-2',
      text: 'How many meals did you eat out this week?',
      type: 'number',
      required: true,
      categoryId: 'nutrition',
      min: 0,
      max: 21,
      helpText: 'Include all meals eaten outside your home',
    },
    {
      id: 'nutrition-3',
      text: 'Which areas of nutrition need improvement?',
      type: 'multiselect',
      required: true,
      categoryId: 'nutrition',
      options: [
        'Meal Planning',
        'Portion Control',
        'Protein Intake',
        'Vegetable Intake',
        'Water Intake',
        'Snacking Habits',
      ],
      helpText: 'Select all that apply',
    },

    // Training Questions
    {
      id: 'training-1',
      text: 'How many workouts did you complete this week?',
      type: 'number',
      required: true,
      categoryId: 'training',
      min: 0,
      max: 14,
      helpText: 'Include both strength and cardio sessions',
    },
    {
      id: 'training-2',
      text: 'How would you rate your workout intensity?',
      type: 'rating',
      required: true,
      categoryId: 'training',
      helpText: 'Consider your effort level and energy during workouts',
    },
    {
      id: 'training-3',
      text: 'Did you experience any injuries or pain?',
      type: 'checkbox',
      required: true,
      categoryId: 'training',
      helpText: 'Check if you experienced any discomfort or injuries',
    },

    // Mindset Questions
    {
      id: 'mindset-1',
      text: 'How would you rate your overall motivation this week?',
      type: 'rating',
      required: true,
      categoryId: 'mindset',
      helpText: 'Consider your drive and enthusiasm for your goals',
    },
    {
      id: 'mindset-2',
      text: 'What challenges did you face this week?',
      type: 'multiselect',
      required: true,
      categoryId: 'mindset',
      options: [
        'Time Management',
        'Stress',
        'Social Pressure',
        'Lack of Motivation',
        'Other',
      ],
      helpText: 'Select all that apply',
    },
    {
      id: 'mindset-3',
      text: 'How confident are you in reaching your goals?',
      type: 'rating',
      required: true,
      categoryId: 'mindset',
      helpText: 'Rate your confidence level from 1-5',
    },

    // Recovery Questions
    {
      id: 'recovery-1',
      text: 'How many hours of sleep did you get on average?',
      type: 'number',
      required: true,
      categoryId: 'recovery',
      min: 0,
      max: 12,
      helpText: 'Enter the average hours of sleep per night',
    },
    {
      id: 'recovery-2',
      text: 'How would you rate your sleep quality?',
      type: 'rating',
      required: true,
      categoryId: 'recovery',
      helpText: 'Consider how well you slept and how rested you felt',
    },
    {
      id: 'recovery-3',
      text: 'Did you practice any recovery techniques?',
      type: 'multiselect',
      required: true,
      categoryId: 'recovery',
      options: [
        'Stretching',
        'Foam Rolling',
        'Meditation',
        'Ice/Heat Therapy',
        'Massage',
        'None',
      ],
      helpText: 'Select all that apply',
    },
  ],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}; 