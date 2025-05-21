'use client';

import { useState, useEffect } from 'react';
import {
  BoltIcon,
  SparklesIcon,
  FireIcon,
  TrophyIcon,
  ChartBarIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import ProfileOverview from './components/ProfileOverview';
import { HabitsCell } from './components/HabitsCell';
import { ActivityFeed } from './components/ActivityFeed';
import { ProgramTimeline } from './components/ProgramTimeline';
import { WeeklyProgress } from './components/WeeklyProgress';
import { CheckInButton } from './components/CheckInButton';
import { useAuth } from '@/lib/firebase/auth';
import { getClientById, getCheckIns } from '@/lib/services/firebaseService';

// Mock data for the past 30 days
const generateMockData = () => {
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  // Generate weight data starting at 185 with small variations
  const weights = Array.from({ length: 30 }, (_, i) => {
    const baseWeight = 185;
    const progress = i * 0.2; // Lose about 0.2 lbs per day
    const variation = Math.random() * 0.4 - 0.2; // Add some natural variation
    return (baseWeight - progress + variation).toFixed(1);
  });

  // Generate body fat percentage data starting at 22% with small variations
  const bodyFat = Array.from({ length: 30 }, (_, i) => {
    const baseBodyFat = 22;
    const progress = i * 0.1; // Lose about 0.1% per day
    const variation = Math.random() * 0.2 - 0.1;
    return (baseBodyFat - progress + variation).toFixed(1);
  });

  return { dates, weights, bodyFat };
};

const mockData = generateMockData();

// Mock workout schedule data
const workoutSchedule = [
  { day: 'Mon', workout: 'Upper Body', time: '7:00 AM', completed: true },
  { day: 'Tue', workout: 'Lower Body', time: '7:00 AM', completed: true },
  { day: 'Wed', workout: 'Rest Day', time: null, completed: true },
  { day: 'Thu', workout: 'Full Body', time: '7:00 AM', completed: false },
  { day: 'Fri', workout: 'HIIT', time: '7:00 AM', completed: false },
  { day: 'Sat', workout: 'Cardio', time: '8:00 AM', completed: false },
  { day: 'Sun', workout: 'Rest Day', time: null, completed: false },
];

// Mock activity feed
const activityFeed = [
  {
    type: 'workout',
    title: 'Completed Upper Body Workout',
    time: '2 hours ago',
    details: '45 minutes • 350 calories',
    icon: BoltIcon,
    color: 'text-blue-500',
  },
  {
    type: 'nutrition',
    title: 'Logged Breakfast',
    time: '5 hours ago',
    details: '520 calories • 35g protein',
    icon: SparklesIcon,
    color: 'text-green-500',
  },
  {
    type: 'achievement',
    title: 'New Personal Best',
    time: '1 day ago',
    details: 'Bench Press: 185 lbs',
    icon: FireIcon,
    color: 'text-orange-500',
  },
];

// Mock nutrition data
const nutritionSummary = {
  calories: { consumed: 1850, goal: 2200 },
  protein: { consumed: 145, goal: 180 },
  carbs: { consumed: 190, goal: 250 },
  fats: { consumed: 55, goal: 70 },
};

// Mock habits data
const weeklyHabits = [
  { id: 1, name: 'Morning Workout', completed: true },
  { id: 2, name: 'Protein Intake', completed: false },
  { id: 3, name: 'Water Intake', completed: true },
];

// Add mock client data
const clientProfile = {
  name: "David Rodriguez",
  avatar: null, // URL for profile photo
  email: "david.r@example.com",
  joinedDate: "January 2024",
  programType: "Weight Loss & Strength",
  currentStreak: 14,
  totalCheckIns: 45,
  badges: [
    {
      id: 1,
      name: "90-Day Warrior",
      icon: TrophyIcon,
      color: "from-amber-500 to-orange-500",
      description: "Completed 90 days of consistent training",
      earnedDate: "2024-03-15"
    },
    {
      id: 2,
      name: "Protein Champion",
      icon: BoltIcon,
      color: "from-blue-500 to-indigo-500",
      description: "Hit protein goals for 30 consecutive days",
      earnedDate: "2024-03-10"
    },
    {
      id: 3,
      name: "Early Bird",
      icon: SparklesIcon,
      color: "from-purple-500 to-pink-500",
      description: "Completed 10 workouts before 7 AM",
      earnedDate: "2024-03-01"
    },
    {
      id: 4,
      name: "Progress Master",
      icon: ChartBarIcon,
      color: "from-green-500 to-emerald-500",
      description: "Logged measurements for 8 consecutive weeks",
      earnedDate: "2024-02-15"
    }
  ],
  stats: {
    completedWorkouts: 48,
    totalWeight: "15 lbs",
    avgCompliance: "92%"
  }
};

// Mock client data (in a real app, this would come from your auth/API)
const mockClientData = {
  id: "cl_david123",
  name: "David Rodriguez",
  programType: "Weight Loss & Strength",
  checkInSchedule: {
    days: [1, 4], // Monday and Thursday
    startHour: 8
  }
};

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      titleColor: 'white',
      bodyColor: 'white',
      borderColor: 'rgba(75, 85, 99, 0.3)',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(156, 163, 175, 1)',
        font: {
          size: 10,
        },
        maxRotation: 0,
      },
    },
    y: {
      grid: {
        color: 'rgba(75, 85, 99, 0.1)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(156, 163, 175, 1)',
        font: {
          size: 10,
        },
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index',
  },
};

// Progress ring component
const ProgressRing = ({ value, max, label, color }) => {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 38; // radius = 38
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="38"
            stroke="rgba(75, 85, 99, 0.2)"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="48"
            cy="48"
            r="38"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}</span>
        </div>
      </div>
      <span className="mt-2 text-sm text-gray-400">{label}</span>
      </div>
    );
};

// Coach Card Component
const CoachCard = ({ coach }: { coach: Coach | null }) => {
  if (!coach) return null;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
      <h2 className="text-lg font-semibold text-white mb-4">Your Coach</h2>
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-xl font-medium text-white">
          {coach.name.charAt(0)}
              </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
              <div>
              <h3 className="text-white font-medium">{coach.name}</h3>
              <p className="text-sm text-gray-400">{coach.specialties.join(' • ')}</p>
            </div>
              </div>
          <div className="mt-4 space-y-3">
            <button className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
              <CalendarIcon className="w-4 h-4" />
              Schedule Session
            </button>
            <button className="w-full flex items-center gap-2 px-3 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors">
              <ChatBubbleLeftRightIcon className="w-4 h-4" />
              Send Message
            </button>
              </div>
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">Typically responds within </span>
              <span className="text-white">{coach.availability.typicalResponse}</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [checkIns, setCheckIns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadClientData() {
      try {
        if (!user?.uid) return;
        const clientData = await getClientById(user.uid);
        setClient(clientData);
        const checkInData = await getCheckIns(user.uid);
        setCheckIns(checkInData);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadClientData();
  }, [user?.uid]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <ProfileOverview client={client} />
          <WeeklyProgress checkIns={checkIns} />
          <ProgramTimeline client={client} />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <CheckInButton client={client} />
          <HabitsCell habits={weeklyHabits} />
          <ActivityFeed activities={activityFeed} />
        </div>
      </div>
    </div>
  );
}