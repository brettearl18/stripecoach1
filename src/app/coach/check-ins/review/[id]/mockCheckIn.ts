export const mockCheckIn = {
  id: 'check-1',
  clientName: 'David Rodriguez',
  clientAvatar: 'https://i.pravatar.cc/150?img=68',
  date: new Date().toISOString(),
  type: 'Weekly Check-in',
  status: 'pending',
  overallScore: {
    current: 88.5,
    previous: 85.2
  },
  metrics: {
    weight: {
      value: 82.5,
      unit: 'kg',
      change: -0.8
    },
    bodyFat: {
      value: 18.5,
      unit: '%',
      change: -0.3
    },
    energy: {
      value: 8.5,
      unit: '/10',
      change: 1.5
    }
  },
  responses: {
    training_1: {
      category: 'training',
      question: 'How many training sessions did you complete this week?',
      type: 'rating_scale',
      answer: '5 out of 5',
      score: 100
    },
    training_2: {
      category: 'training',
      question: 'Rate your overall workout intensity (1-10)',
      type: 'rating_scale',
      answer: '8.5/10',
      score: 85
    },
    training_3: {
      category: 'training',
      question: 'Did you experience any unusual fatigue or pain?',
      type: 'text',
      answer: 'No unusual pain. Energy levels were great throughout all sessions. Recovery between sets was optimal.',
      score: 90
    },
    nutrition_1: {
      category: 'nutrition',
      question: 'How well did you follow your meal plan?',
      type: 'rating_scale',
      answer: '9/10',
      score: 90
    },
    nutrition_2: {
      category: 'nutrition',
      question: 'Did you track your daily water intake?',
      type: 'multiple_choice',
      answer: 'Yes, consistently hit 4L daily target',
      score: 95
    },
    nutrition_3: {
      category: 'nutrition',
      question: 'Any challenges with meal timing or hunger?',
      type: 'text',
      answer: 'Much better this week. Pre-prepared all meals and stuck to eating schedule. No late-night cravings.',
      score: 95
    },
    recovery_1: {
      category: 'recovery',
      question: 'Average hours of sleep per night?',
      type: 'rating_scale',
      answer: '7.8 hours',
      score: 85
    },
    recovery_2: {
      category: 'recovery',
      question: 'Rate your overall stress levels (1-10)',
      type: 'rating_scale',
      answer: '4/10',
      score: 85
    },
    recovery_3: {
      category: 'recovery',
      question: 'Did you complete your recovery protocols?',
      type: 'multiple_choice',
      answer: 'Completed all stretching and mobility work as prescribed',
      score: 90
    },
    lifestyle_1: {
      category: 'lifestyle',
      question: 'How would you rate your energy levels?',
      type: 'rating_scale',
      answer: '9/10',
      score: 90
    },
    lifestyle_2: {
      category: 'lifestyle',
      question: 'Any significant lifestyle changes this week?',
      type: 'text',
      answer: 'Work schedule has stabilized, allowing for better routine adherence. Found a great meal prep rhythm on Sundays.',
      score: 85
    },
    lifestyle_3: {
      category: 'lifestyle',
      question: 'Are you maintaining a good work-life balance?',
      type: 'rating_scale',
      answer: '8/10',
      score: 80
    }
  },
  photos: [
    {
      url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&dpr=2&q=80'
    },
    {
      url: 'https://images.unsplash.com/photo-1603287681836-fd6f68d8b65d?w=800&dpr=2&q=80'
    }
  ],
  previousCheckIn: {
    metrics: {
      weight: {
        value: 83.3
      },
      bodyFat: {
        value: 18.8
      },
      energy: {
        value: 7.0
      }
    }
  }
}; 