import { db } from './firebase';
import { collection, doc, getDocs, addDoc, query, where } from 'firebase/firestore';
import type { Question } from '@/types/checkIn';

export interface QuestionCategory {
  id: string;
  name: string;
  description: string;
  questions: Question[];
}

const defaultCategories: QuestionCategory[] = [
  {
    id: 'nutrition',
    name: 'Nutrition',
    description: 'Questions about diet, eating habits, and nutrition',
    questions: [
      {
        id: 'nutrition-general-1',
        type: 'number',
        text: 'How many meals did you eat today?',
        required: true,
        min: 1,
        max: 10,
      },
      {
        id: 'nutrition-general-2',
        type: 'select',
        text: 'How would you rate your meal preparation this week?',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor'],
      },
      {
        id: 'nutrition-general-3',
        type: 'rating',
        text: 'How satisfied were you with your food choices today?',
        required: true,
        min: 1,
        max: 5,
      },
      {
        id: 'nutrition-general-4',
        type: 'text',
        text: 'What was your biggest nutrition challenge this week?',
        required: false,
      },
    ],
  },
  {
    id: 'nutrition-macros',
    name: 'Macronutrients',
    description: 'Questions about protein, carbs, and fat intake',
    questions: [
      {
        id: 'nutrition-macros-1',
        type: 'text',
        text: "What's your current daily calorie target?",
        required: true,
      },
      {
        id: 'nutrition-macros-2',
        type: 'text',
        text: "What's your protein target (in grams)?",
        required: true,
      },
      {
        id: 'nutrition-macros-3',
        type: 'text',
        text: "What's your carbohydrate target (in grams)?",
        required: true,
      },
      {
        id: 'nutrition-macros-4',
        type: 'text',
        text: "What's your fat target (in grams)?",
        required: true,
      },
      {
        id: 'nutrition-macros-5',
        type: 'text',
        text: "What's your biggest challenge with macronutrient tracking?",
        required: false,
      },
    ],
  },
  {
    id: 'nutrition-meals',
    name: 'Meal Planning & Timing',
    description: 'Questions about meal planning and eating schedule',
    questions: [
      {
        id: 'nutrition-meals-1',
        type: 'text',
        text: "How many meals do you plan to eat today?",
        required: true,
      },
      {
        id: 'nutrition-meals-2',
        type: 'text',
        text: "What's your meal timing strategy?",
        required: false,
      },
      {
        id: 'nutrition-meals-3',
        type: 'text',
        text: "Are you planning any pre/post workout meals?",
        required: false,
      },
      {
        id: 'nutrition-meals-4',
        type: 'text',
        text: "Do you have any specific dietary restrictions?",
        required: true,
      },
      {
        id: 'nutrition-meals-5',
        type: 'text',
        text: "What's your biggest challenge with meal planning?",
        required: false,
      },
    ],
  },
  {
    id: 'nutrition-quality',
    name: 'Food Quality',
    description: 'Questions about food quality and choices',
    questions: [
      {
        id: 'nutrition-quality-1',
        type: 'multiselect',
        text: 'Which of these did you consume today?',
        required: false,
        options: ['Vegetables', 'Fruits', 'Whole Grains', 'Lean Protein', 'Healthy Fats', 'None'],
      },
      {
        id: 'nutrition-quality-2',
        type: 'number',
        text: 'How many servings of vegetables did you eat today?',
        required: true,
        min: 0,
        max: 20,
      },
      {
        id: 'nutrition-quality-3',
        type: 'number',
        text: 'How many servings of fruit did you eat today?',
        required: true,
        min: 0,
        max: 10,
      },
      {
        id: 'nutrition-quality-4',
        type: 'multiselect',
        text: 'What types of processed foods did you consume?',
        required: false,
        options: ['None', 'Packaged Snacks', 'Fast Food', 'Frozen Meals', 'Other'],
      },
      {
        id: 'nutrition-quality-5',
        type: 'rating',
        text: 'How would you rate the quality of your food choices today?',
        required: true,
        min: 1,
        max: 5,
      },
    ],
  },
  {
    id: 'nutrition-hydration',
    name: 'Hydration & Beverages',
    description: 'Questions about hydration and beverage choices',
    questions: [
      {
        id: 'nutrition-hydration-1',
        type: 'number',
        text: 'How many liters of water did you drink today?',
        required: true,
        min: 0,
        max: 10,
      },
      {
        id: 'nutrition-hydration-2',
        type: 'multiselect',
        text: 'What beverages did you consume today?',
        required: false,
        options: ['Water', 'Coffee', 'Tea', 'Sports Drinks', 'Juice', 'Soda', 'None'],
      },
      {
        id: 'nutrition-hydration-3',
        type: 'select',
        text: 'How would you rate your hydration today?',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor'],
      },
      {
        id: 'nutrition-hydration-4',
        type: 'number',
        text: 'How many caffeinated beverages did you consume?',
        required: true,
        min: 0,
        max: 10,
      },
      {
        id: 'nutrition-hydration-5',
        type: 'text',
        text: "What's your biggest hydration challenge?",
        required: false,
      },
    ],
  },
  {
    id: 'exercise',
    name: 'Exercise & Movement',
    description: 'Questions about physical activity and workouts',
    questions: [
      {
        id: 'exercise-1',
        type: 'number',
        text: 'How many workouts did you complete this week?',
        required: true,
        min: 0,
        max: 14,
      },
      {
        id: 'exercise-2',
        type: 'select',
        text: 'How would you rate your workout intensity this week?',
        required: true,
        options: ['Very High', 'High', 'Moderate', 'Low', 'None'],
      },
      {
        id: 'exercise-3',
        type: 'multiselect',
        text: 'What types of exercise did you do this week?',
        required: false,
        options: ['Strength Training', 'Cardio', 'Flexibility', 'Sports', 'Walking', 'None'],
      },
      {
        id: 'exercise-4',
        type: 'rating',
        text: 'How would you rate your energy levels during workouts?',
        required: true,
        min: 1,
        max: 5,
      },
      {
        id: 'exercise-5',
        type: 'text',
        text: 'What was your most challenging workout this week?',
        required: false,
      },
    ],
  },
  {
    id: 'sleep',
    name: 'Sleep & Recovery',
    description: 'Questions about sleep quality and recovery',
    questions: [
      {
        id: 'sleep-1',
        type: 'number',
        text: 'How many hours of sleep did you get last night?',
        required: true,
        min: 0,
        max: 12,
      },
      {
        id: 'sleep-2',
        type: 'select',
        text: 'How would you rate your sleep quality this week?',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor'],
      },
      {
        id: 'sleep-3',
        type: 'multiselect',
        text: 'What factors affected your sleep this week?',
        required: false,
        options: ['Stress', 'Caffeine', 'Exercise', 'Screen Time', 'Noise', 'None'],
      },
      {
        id: 'sleep-4',
        type: 'rating',
        text: 'How well-rested do you feel today?',
        required: true,
        min: 1,
        max: 5,
      },
      {
        id: 'sleep-5',
        type: 'text',
        text: "What's your biggest sleep challenge?",
        required: false,
      },
    ],
  },
  {
    id: 'stress',
    name: 'Stress & Mental Health',
    description: 'Questions about stress levels and mental well-being',
    questions: [
      {
        id: 'stress-1',
        type: 'rating',
        text: 'How would you rate your stress level today?',
        required: true,
        min: 1,
        max: 5,
      },
      {
        id: 'stress-2',
        type: 'select',
        text: 'How are you managing stress this week?',
        required: true,
        options: ['Very Well', 'Well', 'Neutral', 'Poorly', 'Very Poorly'],
      },
      {
        id: 'stress-3',
        type: 'multiselect',
        text: 'What stress management techniques did you use this week?',
        required: false,
        options: ['Meditation', 'Exercise', 'Reading', 'Time with Friends', 'None'],
      },
      {
        id: 'stress-4',
        type: 'text',
        text: "What's your biggest source of stress right now?",
        required: false,
      },
      {
        id: 'stress-5',
        type: 'rating',
        text: 'How would you rate your overall mood today?',
        required: true,
        min: 1,
        max: 5,
      },
    ],
  },
  {
    id: 'goals',
    name: 'Goals & Progress',
    description: 'Questions about goal setting and progress tracking',
    questions: [
      {
        id: 'goals-1',
        type: 'rating',
        text: 'How confident are you in achieving your current goals?',
        required: true,
        min: 1,
        max: 5,
      },
      {
        id: 'goals-2',
        type: 'select',
        text: 'How would you rate your progress this week?',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'No Progress'],
      },
      {
        id: 'goals-3',
        type: 'multiselect',
        text: 'What obstacles are you facing?',
        required: false,
        options: ['Time Management', 'Motivation', 'Resources', 'Knowledge', 'None'],
      },
      {
        id: 'goals-4',
        type: 'text',
        text: "What's your biggest achievement this week?",
        required: false,
      },
      {
        id: 'goals-5',
        type: 'text',
        text: 'What would help you make more progress?',
        required: false,
      },
    ],
  },
  {
    id: 'body-composition',
    name: 'Body Composition',
    description: 'Questions about weight, measurements, and body composition goals',
    questions: [
      {
        id: 'body-1',
        type: 'number',
        text: 'What is your current weight?',
        required: true,
        min: 0,
        max: 500,
      },
      {
        id: 'body-2',
        type: 'select',
        text: 'How would you rate your progress towards your body composition goals?',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'No Progress'],
      },
      {
        id: 'body-3',
        type: 'multiselect',
        text: 'What measurements would you like to track?',
        required: false,
        options: ['Weight', 'Body Fat %', 'Muscle Mass', 'Circumference Measurements', 'Progress Photos'],
      },
      {
        id: 'body-4',
        type: 'text',
        text: 'What specific body composition goals are you working towards?',
        required: false,
      },
      {
        id: 'body-5',
        type: 'rating',
        text: 'How satisfied are you with your current body composition?',
        required: true,
        min: 1,
        max: 5,
      },
    ],
  },
  {
    id: 'energy',
    name: 'Energy & Vitality',
    description: 'Questions about energy levels and overall vitality',
    questions: [
      {
        id: 'energy-1',
        type: 'rating',
        text: 'How would you rate your energy levels today?',
        required: true,
        min: 1,
        max: 5,
      },
      {
        id: 'energy-2',
        type: 'select',
        text: 'When do you typically feel most energetic?',
        required: true,
        options: ['Morning', 'Afternoon', 'Evening', 'Throughout the Day', 'Never'],
      },
      {
        id: 'energy-3',
        type: 'multiselect',
        text: 'What factors affect your energy levels?',
        required: false,
        options: ['Sleep', 'Diet', 'Exercise', 'Stress', 'Hydration', 'Other'],
      },
      {
        id: 'energy-4',
        type: 'text',
        text: 'What activities give you the most energy?',
        required: false,
      },
      {
        id: 'energy-5',
        type: 'rating',
        text: 'How would you rate your overall vitality?',
        required: true,
        min: 1,
        max: 5,
      },
    ],
  },
  {
    id: 'hydration',
    name: 'Hydration',
    description: 'Questions about water intake and hydration habits',
    questions: [
      {
        id: 'hydration-1',
        type: 'number',
        text: 'How many liters of water did you drink today?',
        required: true,
        min: 0,
        max: 10,
      },
      {
        id: 'hydration-2',
        type: 'select',
        text: 'How would you rate your hydration habits this week?',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor'],
      },
      {
        id: 'hydration-3',
        type: 'multiselect',
        text: 'What beverages did you consume today?',
        required: false,
        options: ['Water', 'Coffee', 'Tea', 'Sports Drinks', 'Juice', 'Soda', 'None'],
      },
      {
        id: 'hydration-4',
        type: 'text',
        text: "What's your biggest hydration challenge?",
        required: false,
      },
      {
        id: 'hydration-5',
        type: 'rating',
        text: 'How would you rate your thirst levels today?',
        required: true,
        min: 1,
        max: 5,
      },
    ],
  },
  {
    id: 'recovery',
    name: 'Recovery & Injury Prevention',
    description: 'Questions about recovery practices and injury prevention',
    questions: [
      {
        id: 'recovery-1',
        type: 'select',
        text: 'How would you rate your recovery this week?',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor'],
      },
      {
        id: 'recovery-2',
        type: 'multiselect',
        text: 'What recovery methods did you use this week?',
        required: false,
        options: ['Stretching', 'Foam Rolling', 'Massage', 'Ice/Heat', 'Rest', 'None'],
      },
      {
        id: 'recovery-3',
        type: 'text',
        text: 'Are you experiencing any pain or discomfort?',
        required: false,
      },
      {
        id: 'recovery-4',
        type: 'select',
        text: 'How would you rate your flexibility?',
        required: true,
        options: ['Very Flexible', 'Flexible', 'Average', 'Stiff', 'Very Stiff'],
      },
      {
        id: 'recovery-5',
        type: 'text',
        text: 'What areas of your body need extra attention?',
        required: false,
      },
    ],
  },
  {
    id: 'motivation',
    name: 'Motivation & Mindset',
    description: 'Questions about motivation, mindset, and mental preparation',
    questions: [
      {
        id: 'motivation-1',
        type: 'rating',
        text: 'How motivated are you to achieve your goals today?',
        required: true,
        min: 1,
        max: 5,
      },
      {
        id: 'motivation-2',
        type: 'select',
        text: "What's your primary source of motivation?",
        required: true,
        options: ['Health', 'Appearance', 'Performance', 'Competition', 'Personal Challenge'],
      },
      {
        id: 'motivation-3',
        type: 'multiselect',
        text: 'What motivates you to stay on track?',
        required: false,
        options: ['Progress', 'Support System', 'Goals', 'Accountability', 'Results'],
      },
      {
        id: 'motivation-4',
        type: 'text',
        text: "What's your biggest motivation challenge?",
        required: false,
      },
      {
        id: 'motivation-5',
        type: 'rating',
        text: 'How would you rate your mental toughness today?',
        required: true,
        min: 1,
        max: 5,
      },
    ],
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Habits',
    description: 'Questions about daily habits and lifestyle factors',
    questions: [
      {
        id: 'lifestyle-1',
        type: 'select',
        text: 'How would you rate your daily routine this week?',
        required: true,
        options: ['Very Consistent', 'Consistent', 'Somewhat Consistent', 'Inconsistent'],
      },
      {
        id: 'lifestyle-2',
        type: 'multiselect',
        text: 'What healthy habits did you maintain this week?',
        required: false,
        options: ['Meal Prep', 'Exercise', 'Sleep Schedule', 'Meditation', 'Reading', 'None'],
      },
      {
        id: 'lifestyle-3',
        type: 'text',
        text: "What's your biggest lifestyle challenge?",
        required: false,
      },
      {
        id: 'lifestyle-4',
        type: 'select',
        text: 'How would you rate your work-life balance?',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor'],
      },
      {
        id: 'lifestyle-5',
        type: 'text',
        text: 'What lifestyle changes would you like to make?',
        required: false,
      },
    ],
  },
];

export async function initializeQuestionBank() {
  const questionBankRef = collection(db, 'questionBank');
  
  // Check if questions already exist
  const existingQuestions = await getDocs(questionBankRef);
  
  if (existingQuestions.empty) {
    // Add default categories and questions
    for (const category of defaultCategories) {
      await addDoc(questionBankRef, category);
    }
  }
}

export async function getQuestionBank(): Promise<QuestionCategory[]> {
  const questionBankRef = collection(db, 'questionBank');
  const snapshot = await getDocs(questionBankRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as QuestionCategory[];
}

export async function getQuestionsByCategory(categoryId: string): Promise<Question[]> {
  const questionBankRef = collection(db, 'questionBank');
  const q = query(questionBankRef, where('id', '==', categoryId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return [];
  }
  
  return snapshot.docs[0].data().questions as Question[];
} 