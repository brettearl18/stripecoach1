export const checkIns = [
  {
    id: 1,
    clientName: 'Sarah Johnson',
    date: '2024-03-18',
    status: 'pending',
    type: 'Weekly Check-in',
    metrics: {
      nutrition: {
        score: 85,
        trend: 'up',
        previousScore: 80,
      },
      exercise: {
        score: 90,
        trend: 'up',
        previousScore: 85,
      },
      sleep: {
        score: 75,
        trend: 'down',
        previousScore: 80,
      },
      stress: {
        score: 65,
        trend: 'down',
        previousScore: 60,
      },
      energy: {
        score: 80,
        trend: 'up',
        previousScore: 75,
      },
    },
    notes: "Had a great week with nutrition and exercise, but struggled with sleep due to work stress.",
    goals: {
      completed: ['Meal prep for all weekdays', '4 workout sessions'],
      inProgress: ['Improve sleep schedule', 'Morning meditation'],
    },
    attachments: [
      { id: 1, name: 'progress-photo-1.jpg', type: 'image/jpeg' },
      { id: 2, name: 'workout-log.pdf', type: 'application/pdf' },
    ],
    audioMessages: [
      { id: 1, duration: '1:30', timestamp: '2024-03-18T09:45:00' },
      { id: 2, duration: '0:45', timestamp: '2024-03-18T09:50:00' },
    ],
    aiInsights: {
      overallScore: 82,
      summary: "Sarah shows strong commitment to nutrition and exercise goals, maintaining high consistency in meal prep and workout routines. However, recent work stress is impacting sleep quality and overall stress management.",
      wins: [
        "Consistent meal preparation throughout the week",
        "Exceeded workout frequency target",
        "Improved nutrition metrics by 5%",
        "Maintained high energy levels despite sleep challenges"
      ],
      struggles: [
        "Sleep quality decreased due to work stress",
        "Stress levels trending upward",
        "Morning meditation routine not yet established"
      ],
      recommendations: [
        "Implement stress management techniques before bedtime",
        "Start with 5-minute meditation sessions to build habit",
        "Consider adjusting workout timing if affecting sleep",
        "Schedule regular breaks during work hours"
      ],
      keyMetrics: {
        adherence: 85,
        progress: 88,
        consistency: 90,
        engagement: 95
      },
      priorityLevel: 'medium'
    }
  },
  {
    id: 2,
    clientName: 'Mike Peterson',
    date: '2024-03-18',
    status: 'completed',
    type: 'Monthly Progress',
    metrics: {
      nutrition: {
        score: 92,
        trend: 'up',
        previousScore: 88,
      },
      exercise: {
        score: 95,
        trend: 'up',
        previousScore: 90,
      },
      sleep: {
        score: 88,
        trend: 'up',
        previousScore: 85,
      },
      stress: {
        score: 78,
        trend: 'up',
        previousScore: 70,
      },
      energy: {
        score: 90,
        trend: 'up',
        previousScore: 85,
      },
    },
    notes: "Best month so far! Hit all my targets and feeling great.",
    goals: {
      completed: ['Reach 185lbs', 'Run 5k under 25 mins'],
      inProgress: ['Build morning routine', 'Increase protein intake'],
    },
    attachments: [
      { id: 3, name: 'monthly-progress.jpg', type: 'image/jpeg' },
    ],
    audioMessages: [
      { id: 3, duration: '2:15', timestamp: '2024-03-18T10:15:00' },
    ],
    aiInsights: {
      overallScore: 95,
      summary: "Mike has achieved exceptional progress this month, hitting major milestones in both weight management and cardiovascular fitness. All key metrics show positive trends, indicating effective program adherence.",
      wins: [
        "Reached target weight of 185lbs",
        "Achieved 5k running goal under target time",
        "Consistent improvement across all metrics",
        "Successfully maintaining high energy levels"
      ],
      struggles: [
        "Morning routine still in development phase",
        "Protein intake goals not yet met",
        "Some inconsistency in meal timing"
      ],
      recommendations: [
        "Gradually increase protein intake through specific meal planning",
        "Set structured morning routine with clear time blocks",
        "Consider protein supplementation options",
        "Maintain current exercise intensity while focusing on nutrition timing"
      ],
      keyMetrics: {
        adherence: 95,
        progress: 98,
        consistency: 92,
        engagement: 95
      },
      priorityLevel: 'low'
    }
  },
  {
    id: 3,
    clientName: 'Emma Wilson',
    date: '2024-03-17',
    status: 'pending',
    type: 'Weekly Check-in',
    metrics: {
      nutrition: {
        score: 70,
        trend: 'down',
        previousScore: 75,
      },
      exercise: {
        score: 85,
        trend: 'up',
        previousScore: 80,
      },
      sleep: {
        score: 82,
        trend: 'up',
        previousScore: 78,
      },
      stress: {
        score: 68,
        trend: 'down',
        previousScore: 72,
      },
      energy: {
        score: 75,
        trend: 'down',
        previousScore: 80,
      },
    },
    notes: "Challenging week with work deadlines affecting nutrition and stress levels.",
    goals: {
      completed: ['3 workout sessions', 'Daily water intake goal'],
      inProgress: ['Stress management techniques', 'Evening routine'],
    },
    attachments: [],
    audioMessages: [
      { id: 4, duration: '1:45', timestamp: '2024-03-17T18:30:00' },
    ],
    aiInsights: {
      overallScore: 68,
      summary: "Emma is experiencing significant challenges with work-life balance, impacting nutrition and stress levels. While maintaining exercise commitment, declining metrics in key areas suggest immediate attention is needed.",
      wins: [
        "Maintained workout frequency despite challenges",
        "Achieved daily water intake goals",
        "Slight improvement in sleep quality",
        "Consistent exercise attendance"
      ],
      struggles: [
        "Declining nutrition metrics",
        "Increased stress levels affecting overall wellbeing",
        "Energy levels dropping",
        "Work demands impacting routine adherence"
      ],
      recommendations: [
        "Urgent: Implement stress management techniques",
        "Develop quick, healthy meal options for busy days",
        "Schedule regular stress-relief breaks",
        "Consider temporary workout adjustment to manage energy"
      ],
      keyMetrics: {
        adherence: 75,
        progress: 65,
        consistency: 70,
        engagement: 80
      },
      priorityLevel: 'high'
    }
  },
]; 