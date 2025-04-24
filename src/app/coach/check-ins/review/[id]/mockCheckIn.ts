export const mockCheckIn = {
  id: 'check-1',
  clientId: '4',
  type: 'Weekly Progress Check',
  date: '2024-03-20T10:30:00Z',
  status: 'pending',
  client: {
    id: '4',
    name: 'David Rodriguez',
    email: 'david@example.com'
  },
  responses: [
    {
      question: 'How was your energy level this week?',
      answer: 8.5,
      type: 'scale',
      score: 85
    },
    {
      question: 'Did you complete all planned workouts?',
      answer: 'Yes, completed all sessions',
      type: 'text',
      score: 90
    }
  ],
  metrics: {
    weight: { value: 82.5, unit: 'kg', change: -0.8 },
    sleep: { value: 7.8, unit: 'hours', change: 0.3 },
    energy: { value: 8.5, unit: '/10', change: 1.5 },
    stress: { value: 4, unit: '/10', change: -2 }
  },
  summary: 'Good progress in training, slight nutrition challenges',
  urgency: 'medium'
}; 