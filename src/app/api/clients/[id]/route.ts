import { NextResponse } from 'next/server';

// Mock client data
const mockClient = {
  id: '1',
  name: 'John Smith',
  email: 'john.smith@example.com',
  avatar: null,
  status: 'active',
  joinedAt: '2024-01-15T00:00:00.000Z',
  metrics: {
    streak: 4,
    completionRate: 85,
    lastCheckIn: '2024-03-10T00:00:00.000Z',
    progress: 75
  },
  goals: [
    {
      id: '1',
      title: 'Weight Loss',
      target: 'Lose 10kg',
      progress: 60,
      startDate: '2024-01-15T00:00:00.000Z',
      endDate: '2024-06-15T00:00:00.000Z'
    },
    {
      id: '2',
      title: 'Strength Training',
      target: 'Bench Press 100kg',
      progress: 40,
      startDate: '2024-01-15T00:00:00.000Z',
      endDate: '2024-06-15T00:00:00.000Z'
    }
  ],
  checkIns: [
    {
      id: '1',
      formTitle: 'Weekly Progress Check-in',
      date: '2024-03-10T00:00:00.000Z',
      status: 'completed',
      metrics: {
        weight: '80',
        bodyFat: '18',
        energy: '8',
        sleep: '7',
        stress: '3',
        hydration: '9'
      },
      responses: {
        q1: {
          value: 8,
          text: "Energy levels have been consistently high this week"
        },
        q2: {
          value: null,
          text: "Had some trouble with late-night snacking, but otherwise stuck to the plan"
        },
        q3: {
          value: "Yes",
          text: "Completed all workouts as scheduled"
        },
        q4: {
          value: null,
          text: "Would like to discuss adjusting my macros for better recovery"
        }
      },
      mood: 'great',
      notes: 'Feeling stronger this week'
    },
    {
      id: '2',
      formTitle: 'Weekly Progress Check-in',
      date: '2024-03-03T00:00:00.000Z',
      status: 'completed',
      metrics: {
        weight: '81',
        bodyFat: '18.5',
        energy: '7',
        sleep: '6',
        stress: '4',
        hydration: '8'
      },
      responses: {
        q1: {
          value: 7,
          text: "Energy was good but fluctuated throughout the week"
        },
        q2: {
          value: null,
          text: "Meal prep helped stay on track with nutrition"
        },
        q3: {
          value: "Partially",
          text: "Missed one workout due to work commitments"
        },
        q4: {
          value: null,
          text: "Need to work on better sleep schedule"
        }
      },
      mood: 'good',
      notes: 'Good week overall, sleep could be better'
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
  }
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // In a real application, you would fetch this data from your database
    // For now, we'll return mock data
    return NextResponse.json(mockClient);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch client data' },
      { status: 500 }
    );
  }
} 