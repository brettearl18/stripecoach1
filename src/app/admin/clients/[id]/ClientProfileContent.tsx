'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  UserIcon,
  ClockIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ScaleIcon,
  FireIcon,
  TrophyIcon,
  HeartIcon,
  StarIcon,
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
  CameraIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  DocumentChartBarIcon,
  AdjustmentsHorizontalIcon,
  BookmarkIcon,
} from '@heroicons/react/24/solid';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { Client } from '@/lib/services/firebaseService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ClientProfileContentProps {
  client: Client;
}

export default function ClientProfileContent({ client }: ClientProfileContentProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Weight tracking data
  const weightData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Weight (lbs)',
        data: [165, 163, 161, 158, 156, 155],
        fill: true,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgb(255, 255, 255)',
        titleColor: 'rgb(17, 24, 39)',
        bodyColor: 'rgb(75, 85, 99)',
        borderColor: 'rgb(229, 231, 235)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: () => 'Weight',
          label: (context: any) => `${context.parsed.y} lbs`,
        },
      },
    },
    scales: {
      y: {
        min: 150,
        max: 170,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Badge definitions
  const badges = [
    {
      icon: FireIcon,
      name: "30 Day Streak",
      description: "Completed check-ins for 30 consecutive days",
      color: "text-orange-500",
      bgColor: "bg-orange-100",
      achieved: true,
      date: "Mar 15, 2024"
    },
    {
      icon: ScaleIcon,
      name: "10kg Lost",
      description: "Successfully lost 10kg since starting your journey",
      color: "text-green-500",
      bgColor: "bg-green-100",
      achieved: true,
      date: "Mar 10, 2024"
    },
    {
      icon: HeartIcon,
      name: "Fitness Pro",
      description: "Complete 50 workouts",
      color: "text-red-500",
      bgColor: "bg-red-100",
      achieved: false,
      progress: "35/50"
    },
    {
      icon: StarIcon,
      name: "90% Consistency",
      description: "Maintain a 90% program consistency for 4 weeks",
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      achieved: false,
      progress: "85%"
    }
  ];

  // Mock check-in history data
  const checkInHistory = [
    {
      id: 1,
      date: "2024-03-15",
      clientMessage: "Completed all workouts this week. Energy levels are good but having some difficulty with the new diet plan. Sugar cravings are strong in the evenings.",
      coachResponse: "Great work on the workouts! For the sugar cravings, try having some berries with Greek yogurt in the evening. It's a good way to satisfy the sweet tooth while staying on track.",
      metrics: {
        weight: 155,
        sleep: 7.5,
        energy: 8,
        stress: 6
      }
    },
    {
      id: 2,
      date: "2024-03-08",
      clientMessage: "Missed one workout due to work commitments. Sleep has improved since starting the evening routine. Following meal plan at about 90% compliance.",
      coachResponse: "Don't worry about the missed workout - life happens! Really pleased to hear about the sleep improvements. For next week, let's focus on maintaining that evening routine and I'll adjust the workout schedule to better fit your work commitments.",
      metrics: {
        weight: 156,
        sleep: 7,
        energy: 7,
        stress: 5
      }
    },
    {
      id: 3,
      date: "2024-03-01",
      clientMessage: "Great week! Hit all my workout targets and tried the new recipes. Particularly enjoying the morning smoothie routine.",
      coachResponse: "Excellent progress! Love hearing about the smoothies. I'm noticing consistent improvement in your energy levels. Let's build on this momentum!",
      metrics: {
        weight: 158,
        sleep: 6.5,
        energy: 6,
        stress: 7
      }
    }
  ];

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/clients"
              className="text-slate-600 hover:text-slate-800"
            >
              Back to Clients
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Client Profile</h1>
          </div>
          <button
            onClick={() => window.location.href = `/admin/clients/${client.id}/report`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            View Report
          </button>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link
            href={`/admin/clients/${client.id}/photos`}
            className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <div className="p-2 bg-purple-100 rounded-lg mb-2">
              <CameraIcon className="h-6 w-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-slate-900">Progress Photos</span>
            <span className="text-xs text-slate-500 mt-1">12 photos</span>
          </Link>

          <Link
            href={`/admin/clients/${client.id}/measurements`}
            className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <div className="p-2 bg-blue-100 rounded-lg mb-2">
              <AdjustmentsHorizontalIcon className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-900">Measurements</span>
            <span className="text-xs text-slate-500 mt-1">Last updated: 3d ago</span>
          </Link>

          <Link
            href={`/admin/clients/${client.id}/check-ins`}
            className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <div className="p-2 bg-green-100 rounded-lg mb-2">
              <ClipboardDocumentListIcon className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-slate-900">Check-ins</span>
            <span className="text-xs text-slate-500 mt-1">24 total</span>
          </Link>

          <Link
            href={`/admin/clients/${client.id}/calendar`}
            className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <div className="p-2 bg-orange-100 rounded-lg mb-2">
              <CalendarDaysIcon className="h-6 w-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-slate-900">Schedule</span>
            <span className="text-xs text-slate-500 mt-1">Next: Tomorrow</span>
          </Link>

          <Link
            href={`/admin/clients/${client.id}/analytics`}
            className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <div className="p-2 bg-indigo-100 rounded-lg mb-2">
              <DocumentChartBarIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-slate-900">Analytics</span>
            <span className="text-xs text-slate-500 mt-1">View trends</span>
          </Link>

          <Link
            href={`/admin/clients/${client.id}/notes`}
            className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <div className="p-2 bg-rose-100 rounded-lg mb-2">
              <BookmarkIcon className="h-6 w-6 text-rose-600" />
            </div>
            <span className="text-sm font-medium text-slate-900">Coach Notes</span>
            <span className="text-xs text-slate-500 mt-1">8 notes</span>
          </Link>
        </div>

        {/* Client Info Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
              <UserIcon className="h-10 w-10 text-slate-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{client.name}</h2>
              <p className="text-slate-500">{client.email}</p>
              <div className="mt-2">
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  client.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                }`}>
                  {client.status || 'inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats and Weight Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Sessions Completed</span>
                <span className="font-semibold text-slate-900">24/36</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Current Weight</span>
                <span className="font-semibold text-slate-900">155 lbs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Weight Lost</span>
                <span className="font-semibold text-green-600">-10 lbs</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Program Adherence</span>
                <span className="font-semibold text-slate-900">85%</span>
              </div>
            </div>
          </div>

          {/* Weight Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Weight Progress</h3>
            <div className="h-64">
              <Line data={weightData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* AI Health Summary */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">AI Health Summary</h3>
          </div>

          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-indigo-900">
                Client has shown consistent progress in their fitness journey, particularly in weight management
                and nutrition habits.
              </p>
            </div>

            {/* Recent Wins */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-3">Recent Wins</h4>
              <div className="space-y-2">
                {[
                  'Achieved personal best in workout performance',
                  'Maintained consistent meal prep schedule',
                  'Successfully implemented new workout routine',
                  'Reduced stress levels through mindfulness practice'
                ].map((win, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-green-800">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <span>{win}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-3">Areas for Improvement</h4>
              <div className="space-y-2">
                {[
                  'Morning workout attendance could be more consistent',
                  'Water intake below target levels',
                  'Post-workout nutrition timing needs adjustment'
                ].map((area, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-amber-800">
                    <ExclamationCircleIcon className="h-4 w-4 text-amber-600" />
                    <span>{area}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-amber-100 p-2 rounded-lg">
              <TrophyIcon className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Achievement Badges</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map((badge, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl border ${badge.achieved ? 'border-gray-200' : 'border-dashed border-gray-300'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${badge.bgColor}`}>
                    <badge.icon className={`h-6 w-6 ${badge.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900">{badge.name}</h4>
                      {badge.achieved ? (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          Achieved
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{badge.description}</p>
                    {badge.achieved ? (
                      <p className="text-xs text-slate-400 mt-2">Achieved {badge.date}</p>
                    ) : (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>Progress</span>
                          <span>{badge.progress}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${badge.color.replace('text', 'bg')}`}
                            style={{ width: badge.progress.includes('/') 
                              ? `${(parseInt(badge.progress.split('/')[0]) / parseInt(badge.progress.split('/')[1])) * 100}%`
                              : badge.progress 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Check-in History */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Check-in History</h3>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-800">
              View All
            </button>
          </div>

          <div className="space-y-6">
            {checkInHistory.map((checkIn) => (
              <div key={checkIn.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-900">
                      {new Date(checkIn.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-slate-500">
                    <span>Weight: {checkIn.metrics.weight} lbs</span>
                    <span>Sleep: {checkIn.metrics.sleep}h</span>
                    <span>Energy: {checkIn.metrics.energy}/10</span>
                    <span>Stress: {checkIn.metrics.stress}/10</span>
                  </div>
                </div>

                {/* Client Message */}
                <div className="mb-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-600">{checkIn.clientMessage}</p>
                    </div>
                  </div>
                </div>

                {/* Coach Response */}
                <div className="ml-6">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <ChatBubbleLeftIcon className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 bg-indigo-50 rounded-lg p-3">
                      <p className="text-sm text-indigo-900">{checkIn.coachResponse}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Goals</h3>
          <div className="flex flex-wrap gap-2">
            {client.goals?.map((goal, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
              >
                {goal}
              </span>
            )) || <p className="text-slate-500">No goals set</p>}
          </div>
        </div>
      </div>
    </div>
  );
} 