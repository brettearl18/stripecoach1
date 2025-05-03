import { ProgramTemplate } from '../types/program';

export const defaultProgramTemplates: ProgramTemplate[] = [
  {
    id: 'weight-loss-basic',
    title: 'Basic Weight Loss Program',
    description: 'A simple 8-week weight loss program focusing on nutrition and basic exercise',
    type: 'weight-loss',
    category: 'fitness',
    duration: 8,
    structure: {
      modules: [
        {
          id: 'nutrition-basics',
          title: 'Nutrition Basics',
          description: 'Learn the fundamentals of healthy eating',
          order: 1,
          duration: 2,
          content: {
            lessons: [
              {
                id: 'meal-planning',
                title: 'Basic Meal Planning',
                content: 'How to plan your meals for the week'
              },
              {
                id: 'portion-control',
                title: 'Portion Control',
                content: 'Understanding proper portion sizes'
              }
            ],
            tasks: [
              {
                id: 'meal-prep',
                title: 'Weekly Meal Prep',
                description: 'Prepare your meals for the week'
              }
            ],
            milestones: [
              {
                id: 'first-week',
                title: 'First Week Complete',
                description: 'Successfully complete your first week of meal planning'
              }
            ]
          }
        },
        {
          id: 'basic-exercise',
          title: 'Basic Exercise',
          description: 'Simple exercises to get started',
          order: 2,
          duration: 2,
          content: {
            lessons: [
              {
                id: 'cardio-basics',
                title: 'Cardio Basics',
                content: 'Introduction to basic cardio exercises'
              },
              {
                id: 'strength-basics',
                title: 'Strength Basics',
                content: 'Basic strength training exercises'
              }
            ],
            tasks: [
              {
                id: 'weekly-workouts',
                title: 'Complete 3 Workouts',
                description: 'Complete 3 workouts this week'
              }
            ],
            milestones: [
              {
                id: 'first-workout',
                title: 'First Workout Complete',
                description: 'Complete your first workout'
              }
            ]
          }
        }
      ],
      resources: [],
      assessments: []
    },
    settings: {
      autoAssign: true,
      notifications: {
        moduleStart: true,
        taskDue: true,
        milestoneAchieved: true,
        assessmentDue: false,
        weeklyProgress: true
      },
      progressTracking: {
        trackModuleCompletion: true,
        trackAssessments: false,
        trackTasks: true,
        trackMilestones: true,
        requireAllTasks: false
      }
    },
    metadata: {
      createdBy: 'system',
      lastModifiedBy: 'system',
      version: '1.0.0',
      tags: ['weight-loss', 'beginner'],
      status: 'published'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'muscle-gain-basic',
    title: 'Basic Muscle Building Program',
    description: 'A simple 8-week program for building muscle',
    type: 'muscle-gain',
    category: 'fitness',
    duration: 8,
    structure: {
      modules: [
        {
          id: 'strength-training',
          title: 'Strength Training Basics',
          description: 'Learn basic strength training exercises',
          order: 1,
          duration: 2,
          content: {
            lessons: [
              {
                id: 'compound-movements',
                title: 'Compound Movements',
                content: 'Introduction to basic compound exercises'
              },
              {
                id: 'proper-form',
                title: 'Proper Form',
                content: 'Learn proper form for basic exercises'
              }
            ],
            tasks: [
              {
                id: 'strength-workout',
                title: 'Complete Strength Workout',
                description: 'Complete your first strength training workout'
              }
            ],
            milestones: [
              {
                id: 'first-lift',
                title: 'First Lift Complete',
                description: 'Complete your first strength training session'
              }
            ]
          }
        },
        {
          id: 'nutrition-for-muscle',
          title: 'Nutrition for Muscle Growth',
          description: 'Learn about nutrition for muscle building',
          order: 2,
          duration: 2,
          content: {
            lessons: [
              {
                id: 'protein-basics',
                title: 'Protein Basics',
                content: 'Understanding protein needs for muscle growth'
              },
              {
                id: 'meal-timing',
                title: 'Meal Timing',
                content: 'When to eat for optimal muscle growth'
              }
            ],
            tasks: [
              {
                id: 'protein-tracking',
                title: 'Track Protein Intake',
                description: 'Track your protein intake for a week'
              }
            ],
            milestones: [
              {
                id: 'nutrition-plan',
                title: 'Nutrition Plan Created',
                description: 'Create your first muscle-building meal plan'
              }
            ]
          }
        }
      ],
      resources: [],
      assessments: []
    },
    settings: {
      autoAssign: true,
      notifications: {
        moduleStart: true,
        taskDue: true,
        milestoneAchieved: true,
        assessmentDue: false,
        weeklyProgress: true
      },
      progressTracking: {
        trackModuleCompletion: true,
        trackAssessments: false,
        trackTasks: true,
        trackMilestones: true,
        requireAllTasks: false
      }
    },
    metadata: {
      createdBy: 'system',
      lastModifiedBy: 'system',
      version: '1.0.0',
      tags: ['muscle-gain', 'beginner'],
      status: 'published'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
]; 