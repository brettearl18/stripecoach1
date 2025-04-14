'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  FireIcon,
  TrophyIcon,
  HeartIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  StarIcon,
  CheckCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// Sample data - replace with real data from API later
const progressData = [
  { date: '2024-01', weight: 85, calories: 2200, steps: 8000 },
  { date: '2024-02', weight: 83, calories: 2150, steps: 8500 },
  { date: '2024-03', weight: 82, calories: 2100, steps: 9000 },
  { date: '2024-04', weight: 81, calories: 2050, steps: 9500 },
];

const upcomingCheckIns = [
  { date: '2024-04-15', type: 'Weekly Check-in' },
  { date: '2024-04-22', type: 'Progress Photos' },
  { date: '2024-04-29', type: 'Monthly Review' },
];

const badges = [
  {
    icon: FireIcon,
    name: "30 Day Streak",
    description: "Completed check-ins for 30 consecutive days",
    achieved: true,
    date: "Mar 15, 2024"
  },
  {
    icon: TrophyIcon,
    name: "10kg Lost",
    description: "Successfully lost 10kg since starting your journey",
    achieved: true,
    date: "Mar 10, 2024"
  },
  {
    icon: HeartIcon,
    name: "Fitness Pro",
    description: "Complete 50 workouts",
    achieved: false,
    progress: "35/50"
  },
  {
    icon: StarIcon,
    name: "90% Consistency",
    description: "Maintain a 90% program consistency for 4 weeks",
    achieved: false,
    progress: "85%"
  }
];

const recentWins = [
  'Achieved personal best in workout performance',
  'Maintained consistent meal prep schedule',
  'Successfully implemented new workout routine',
  'Reduced stress levels through mindfulness practice'
];

export default function ClientDashboard() {
  const [selectedMetric, setSelectedMetric] = useState('weight');

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
          <p className="text-gray-400">Here's your progress overview</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
          Start Check-in
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gray-800 border-gray-700">
          <div className="flex items-center gap-2">
            <BoltIcon className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-medium text-gray-200">Current Weight</h3>
          </div>
          <p className="text-3xl font-bold text-white mt-2">81 kg</p>
          <p className="text-green-400 text-sm mt-1">-4kg from start</p>
        </Card>
        
        <Card className="p-6 bg-gray-800 border-gray-700">
          <div className="flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-medium text-gray-200">Daily Average</h3>
          </div>
          <p className="text-3xl font-bold text-white mt-2">2,100</p>
          <p className="text-gray-400 text-sm mt-1">calories/day</p>
        </Card>

        <Card className="p-6 bg-gray-800 border-gray-700">
          <div className="flex items-center gap-2">
            <HeartIcon className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-medium text-gray-200">Workout Streak</h3>
          </div>
          <p className="text-3xl font-bold text-white mt-2">12</p>
          <p className="text-gray-400 text-sm mt-1">days</p>
        </Card>

        <Card className="p-6 bg-gray-800 border-gray-700">
          <div className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-medium text-gray-200">Compliance</h3>
          </div>
          <p className="text-3xl font-bold text-white mt-2">85%</p>
          <p className="text-gray-400 text-sm mt-1">Last 4 weeks</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <Card className="p-6 bg-gray-800 border-gray-700 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Progress Tracking</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedMetric('weight')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  selectedMetric === 'weight' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Weight
              </button>
              <button 
                onClick={() => setSelectedMetric('calories')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  selectedMetric === 'calories' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Calories
              </button>
              <button 
                onClick={() => setSelectedMetric('steps')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  selectedMetric === 'steps' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Steps
              </button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey={selectedMetric}
                  stroke="#6366F1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366F1' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Upcoming Check-ins */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Upcoming Check-ins</h2>
          <div className="space-y-4">
            {upcomingCheckIns.map((checkIn, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-700/50 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-indigo-400" />
                <div>
                  <p className="text-sm font-medium text-white">{checkIn.type}</p>
                  <p className="text-xs text-gray-400">{checkIn.date}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Wins */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Recent Wins</h2>
          <div className="space-y-3">
            {recentWins.map((win, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-300">{win}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Badges and Achievements */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Badges & Achievements</h2>
          <div className="grid grid-cols-2 gap-4">
            {badges.map((badge, index) => (
              <div key={index} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <badge.icon className="h-5 w-5 text-yellow-400" />
                  <h3 className="text-sm font-medium text-white">{badge.name}</h3>
                </div>
                <p className="text-xs text-gray-400 mb-2">{badge.description}</p>
                {badge.achieved ? (
                  <p className="text-xs text-green-400">Achieved {badge.date}</p>
                ) : (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{badge.progress}</span>
                    </div>
                    <div className="h-1.5 bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400"
                        style={{ 
                          width: badge.progress.includes('/') 
                            ? `${(parseInt(badge.progress.split('/')[0]) / parseInt(badge.progress.split('/')[1])) * 100}%`
                            : badge.progress 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}