const mockClientData = {
  id: '1',
  firstName: 'John',
  lastName: 'Smith',
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: '+1 (555) 123-4567',
  startDate: '2024-01-15',
  status: 'active',
  metrics: {
    streak: 4,
    completionRate: 85,
    lastCheckIn: '2024-03-20',
    progress: 75,
    weight: { value: 82.5, unit: 'kg', change: -0.8 },
    sleep: { value: 7.8, unit: 'hours', change: 0.3 },
    energy: { value: 8.5, unit: '/10', change: 1.5 },
    stress: { value: 4, unit: '/10', change: -2 }
  },
  program: {
    type: 'Weight Loss',
    currentWeek: 8,
    totalWeeks: 12,
    phase: 'Progressive'
  },
  goals: [
    { id: '1', title: 'Lose 20 pounds by June', progress: 65 },
    { id: '2', title: 'Run a 5K under 30 minutes', progress: 40 },
    { id: '3', title: 'Establish consistent meal prep routine', progress: 80 },
    { id: '4', title: 'Improve sleep quality', progress: 70 }
  ],
  checkIns: [
    {
      id: '1',
      formTitle: 'Weekly Progress Check-in',
      date: '2024-03-20',
      status: 'completed',
      metrics: {
        weight: '185',
        sleep: '7.5',
        energy: '8',
        stress: '4'
      },
      responses: {
        q1: { text: "Great progress this week. All workouts completed." },
        q2: { text: "Energy levels have been consistently high" },
        q3: { text: "Completed all planned workouts" },
        q4: { text: "No concerns this week" }
      },
      notes: 'Great progress this week. All workouts completed.'
    },
    {
      id: '2',
      formTitle: 'Weekly Progress Check-in',
      date: '2024-03-13',
      status: 'completed',
      metrics: {
        weight: '187',
        sleep: '7',
        energy: '7',
        stress: '5'
      },
      responses: {
        q1: { text: "Struggled with evening snacking but maintained workout schedule." },
        q2: { text: "Energy was good but fluctuated" },
        q3: { text: "Missed one workout due to work" },
        q4: { text: "Need help with evening cravings" }
      },
      notes: 'Struggled with evening snacking but maintained workout schedule.'
    }
  ],
  weeklyProgress: {
    training: 85,
    nutrition: 75,
    recovery: 80
  },
  forms: [
    {
      id: 'form1',
      title: 'Monthly Assessment',
      status: 'pending',
      date: '2024-04-01'
    },
    {
      id: 'form2',
      title: 'Nutrition Questionnaire',
      status: 'completed',
      date: '2024-03-15'
    }
  ],
  aiSummary: {
    overview: "John has been making steady progress towards his goals. His consistency in check-ins and workout completion is commendable.",
    wins: [
      "Maintained consistent workout schedule",
      "Improved sleep quality",
      "Hit protein intake goals"
    ],
    challenges: [
      "Managing stress levels",
      "Weekend nutrition adherence"
    ],
    recommendations: [
      "Focus on stress management techniques",
      "Implement evening routine for better sleep",
      "Add mobility work to recovery days"
    ]
  },
  checkInHistory: Array.from({ length: 20 }, (_, i) => ({
    week: i + 1,
    date: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)).toISOString(),
    score: Math.random() > 0.1 ? Math.floor(Math.random() * 40) + 60 : 0
  }))
};

export default mockClientData; 