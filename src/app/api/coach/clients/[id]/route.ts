import { NextResponse } from 'next/server';

// Mock client data for development
const mockClient = {
  id: '1',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@example.com',
  phone: '+1 (555) 123-4567',
  startDate: '2024-01-15',
  status: 'active',
  metrics: {
    streak: 4,
    completionRate: 85,
    lastCheckIn: '2024-03-20',
    progress: 75
  },
  program: {
    type: 'Weight Loss',
    currentWeek: 8,
    totalWeeks: 12,
    phase: 'Progressive'
  },
  goals: [
    'Lose 20 pounds by June',
    'Run a 5K under 30 minutes',
    'Establish consistent meal prep routine',
    'Improve sleep quality'
  ],
  checkIns: [
    {
      id: '1',
      date: '2024-03-20',
      status: 'completed',
      metrics: {
        weight: 185,
        sleep: 7.5,
        energy: 8,
        stress: 4
      },
      notes: 'Great progress this week. All workouts completed.'
    },
    {
      id: '2',
      date: '2024-03-13',
      status: 'completed',
      metrics: {
        weight: 187,
        sleep: 7,
        energy: 7,
        stress: 5
      },
      notes: 'Struggled with evening snacking but maintained workout schedule.'
    }
  ]
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // In production, this would fetch from your database
  return NextResponse.json(mockClient);
} 