'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  TrophyIcon,
  FireIcon,
  PhotoIcon,
  ShareIcon,
  SparklesIcon,
  BoltIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline';
import Image from 'next/image';

// Extended mock data for check-in history
const EXTENDED_HISTORY = Array.from({ length: 52 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (index * 7));
  return {
    id: `check-${52 - index}`,
    date: date.toISOString(),
    score: Math.floor(70 + Math.random() * 25), // Random score between 70-95
    status: Math.random() > 0.1 ? 'completed' : 'missed', // 10% chance of missed
    week: 52 - index,
    metrics: {
      weight: {
        value: 82.5 - (index * 0.1),
        change: -0.1
      },
      bodyFat: {
        value: 18.5 - (index * 0.05),
        change: -0.05
      },
      energy: {
        value: Math.min(10, 7 + (index * 0.05)),
        change: 0.05
      }
    },
    summary: [
      'Completed all workouts with good intensity',
      'Nutrition plan followed consistently',
      'Sleep quality improving',
      'Energy levels stable throughout the week'
    ][Math.floor(Math.random() * 4)]
  };
});

// Enhanced analytics data with journey insights
const analyticsData = {
  compliance: {
    current: 85,
    trend: '+5%',
    lastMonth: [75, 82, 78, 85]
  },
  streaks: {
    current: 3,
    longest: 8,
    thisMonth: 12
  },
  improvements: [
    { metric: 'Weight', change: '-2.5kg', period: '3 months' },
    { metric: 'Body Fat', change: '-1.2%', period: '3 months' },
    { metric: 'Energy', change: '+2.1', period: '1 month' }
  ],
  journey: {
    startDate: '2023-09-15',
    duration: '6 months',
    totalCheckIns: 24,
    completionRate: '92%',
    milestones: [
      {
        date: '2023-10-01',
        title: 'First Month Complete',
        achievement: 'Established consistent workout routine',
        metrics: {
          weight: '85kg',
          bodyFat: '19.5%',
          energy: '6.5/10'
        }
      },
      {
        date: '2023-12-15',
        title: '3-Month Milestone',
        achievement: 'Hit target weight for Phase 1',
        metrics: {
          weight: '82kg',
          bodyFat: '18.2%',
          energy: '7.8/10'
        }
      },
      {
        date: '2024-03-15',
        title: '6-Month Transformation',
        achievement: 'Achieved initial body composition goals',
        metrics: {
          weight: '79.5kg',
          bodyFat: '15.8%',
          energy: '8.9/10'
        }
      }
    ],
    keyWins: [
      'Established consistent 5AM workout routine',
      'Overcame sugar cravings and developed healthy eating habits',
      'Improved sleep quality from 5.5 to 7.8 hours average',
      'Increased strength across all major lifts by 35%',
      'Successfully managed stress through mindfulness practices'
    ],
    challenges: [
      'Initial adjustment to early morning workouts',
      'Holiday season nutrition management',
      'Minor shoulder setback in month 2 (fully recovered)',
    ],
    nextGoals: [
      'Reach 14% body fat while maintaining muscle mass',
      'Complete first half-marathon',
      'Master advanced calisthenics movements'
    ],
    progressPhotos: {
      start: {
        date: '2023-09-15',
        metrics: {
          weight: '85kg',
          bodyFat: '19.5%'
        },
        photos: {
          front: 'https://placehold.co/600x800/e2e8f0/1e293b?text=Before+-+Front',
          back: 'https://placehold.co/600x800/e2e8f0/1e293b?text=Before+-+Back',
          side: 'https://placehold.co/600x800/e2e8f0/1e293b?text=Before+-+Side'
        }
      },
      current: {
        date: '2024-03-15',
        metrics: {
          weight: '79.5kg',
          bodyFat: '15.8%'
        },
        photos: {
          front: 'https://placehold.co/600x800/e2e8f0/1e293b?text=After+-+Front',
          back: 'https://placehold.co/600x800/e2e8f0/1e293b?text=After+-+Back',
          side: 'https://placehold.co/600x800/e2e8f0/1e293b?text=After+-+Side'
        }
      }
    }
  },
  aiInsights: {
    summary: "David has shown exceptional progress over the past 6 months, with consistent improvement in key metrics. His dedication to the 5AM workout routine and nutrition plan has yielded impressive results, particularly in body composition and energy levels.",
    keyHighlights: [
      {
        type: 'achievement',
        icon: <TrophyIcon className="h-5 w-5 text-yellow-500" />,
        title: 'Remarkable Transformation',
        description: 'Lost 5.5kg while maintaining muscle mass and reducing body fat by 3.7%'
      },
      {
        type: 'habit',
        icon: <BoltIcon className="h-5 w-5 text-purple-500" />,
        title: 'Consistent Habits',
        description: '92% check-in rate with an average compliance score of 85%'
      },
      {
        type: 'breakthrough',
        icon: <RocketLaunchIcon className="h-5 w-5 text-blue-500" />,
        title: 'Lifestyle Changes',
        description: 'Successfully transitioned to morning workouts and improved sleep quality'
      }
    ],
    recommendations: [
      'Consider increasing protein intake to support muscle retention during the final cut phase',
      'Implement deload week every 6 weeks to prevent potential shoulder issues',
      'Focus on mobility work to prepare for advanced calisthenics goals'
    ],
    socialHighlights: {
      title: "6-Month Transformation Highlights",
      description: "From consistent 5AM workouts to overcoming sugar cravings, David's journey showcases the power of dedication and smart training. Key achievements include:",
      stats: [
        { label: 'Weight Lost', value: '5.5kg' },
        { label: 'Body Fat Reduced', value: '3.7%' },
        { label: 'Strength Increased', value: '35%' },
        { label: 'Sleep Quality', value: '+2.3hrs' }
      ],
      tags: ['#FitnessJourney', '#TransformationTuesday', '#HealthyLifestyle', '#FitnessGoals']
    }
  }
};

export default function CheckInHistory() {
  const params = useParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [clientName, setClientName] = useState('David Rodriguez');
  const [view, setView] = useState<'history' | 'analytics'>('history');
  const [activeTab, setActiveTab] = useState<'overview' | 'insights' | 'history'>('overview');

  // Filter and sort check-ins
  const filteredHistory = EXTENDED_HISTORY
    .filter(checkIn => {
      const matchesSearch = checkIn.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || checkIn.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          break;
        case 'score':
          comparison = (b.score || 0) - (a.score || 0);
          break;
        case 'week':
          comparison = b.week - a.week;
          break;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Sticky Navigation */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Client Info */}
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Client Progress
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {clientName}
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Compliance</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {analyticsData.compliance.current}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {analyticsData.streaks.current} weeks
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Check-ins</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {analyticsData.journey.totalCheckIns}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg flex items-center gap-2 ${
                activeTab === 'insights'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <SparklesIcon className="h-4 w-4" />
              AI Insights
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-500 dark:border-blue-500'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Check-in History
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Existing Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Compliance Score */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Overall Compliance
                </h3>
                <div className="mt-2 flex items-baseline">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                    {analyticsData.compliance.current}%
                  </p>
                  <p className="ml-2 text-sm font-medium text-green-500">
                    {analyticsData.compliance.trend}
                  </p>
                </div>
                <div className="mt-4">
                  <div className="flex space-x-2">
                    {analyticsData.compliance.lastMonth.map((score, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 rounded"
                        style={{ height: `${score * 0.4}px` }}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Last 4 weeks
                  </p>
                </div>
              </div>

              {/* Check-in Streaks */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Check-in Streaks
                </h3>
                <div className="mt-2">
                  <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                    {analyticsData.streaks.current}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Current streak
                  </p>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {analyticsData.streaks.longest}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">Longest</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {analyticsData.streaks.thisMonth}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">This month</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Improvements */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Key Improvements
                </h3>
                <div className="mt-2 space-y-3">
                  {analyticsData.improvements.map((improvement, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {improvement.metric}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-green-500">
                          {improvement.change}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {improvement.period}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Journey Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Journey Overview
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Started {format(new Date(analyticsData.journey.startDate), 'MMM d, yyyy')} • {analyticsData.journey.duration}
                </div>
              </div>

              {/* Progress Photos */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Transformation Progress
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Photos */}
                  <div className="relative group">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={analyticsData.journey.progressPhotos.start.photos.front}
                        alt="Progress photo from start"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2">
                        <ShareIcon className="h-5 w-5" />
                        Share Success
                      </button>
                    </div>
                    <div className="mt-2">
                      <div className="font-medium text-gray-900 dark:text-white">
                        Start
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(analyticsData.journey.progressPhotos.start.date), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {analyticsData.journey.progressPhotos.start.metrics.weight} • {analyticsData.journey.progressPhotos.start.metrics.bodyFat} body fat
                      </div>
                    </div>
                  </div>

                  {/* Current Photos */}
                  <div className="relative group">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <img
                        src={analyticsData.journey.progressPhotos.current.photos.front}
                        alt="Progress photo from current"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex items-center justify-center">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2">
                        <ShareIcon className="h-5 w-5" />
                        Share Success
                      </button>
                    </div>
                    <div className="mt-2">
                      <div className="font-medium text-gray-900 dark:text-white">
                        Current
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(analyticsData.journey.progressPhotos.current.date), 'MMM d, yyyy')}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {analyticsData.journey.progressPhotos.current.metrics.weight} • {analyticsData.journey.progressPhotos.current.metrics.bodyFat} body fat
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Journey Milestones */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Key Milestones
                </h3>
                <div className="space-y-6">
                  {analyticsData.journey.milestones.map((milestone, index) => (
                    <div key={index} className="relative pl-8 before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-blue-200 dark:before:bg-blue-800">
                      <div className="absolute left-0 top-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <TrophyIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(milestone.date), 'MMM d, yyyy')}
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white mt-1">
                          {milestone.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                          {milestone.achievement}
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                          {Object.entries(milestone.metrics).map(([key, value]) => (
                            <div key={key}>
                              <div className="text-gray-500 dark:text-gray-400 capitalize">{key}</div>
                              <div className="font-medium text-gray-900 dark:text-white">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Wins & Challenges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <FireIcon className="h-5 w-5 text-green-500" />
                    Key Wins
                  </h3>
                  <ul className="space-y-3">
                    {analyticsData.journey.keyWins.map((win, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{win}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Challenges Overcome
                  </h3>
                  <ul className="space-y-3">
                    {analyticsData.journey.challenges.map((challenge, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Next Goals */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Next Goals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analyticsData.journey.nextGoals.map((goal, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-300">{goal}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-8">
            {/* AI Summary Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <SparklesIcon className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    AI Analysis
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {analyticsData.aiInsights.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analyticsData.aiInsights.keyHighlights.map((highlight, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{highlight.icon}</div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {highlight.title}
                      </h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        {highlight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                AI Recommendations
              </h3>
              <div className="space-y-4">
                {analyticsData.aiInsights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <BoltIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Photos Comparison */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Transformation Progress
                </h3>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                  <ShareIcon className="h-5 w-5" />
                  Share Progress
                </button>
              </div>

              {/* Metrics Summary */}
              <div className="flex justify-between mb-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {analyticsData.journey.progressPhotos.start.metrics.weight}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {analyticsData.journey.progressPhotos.start.metrics.bodyFat} BF
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(analyticsData.journey.progressPhotos.start.date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center mb-1">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-500">
                      {(parseFloat(analyticsData.journey.progressPhotos.start.metrics.bodyFat) - 
                        parseFloat(analyticsData.journey.progressPhotos.current.metrics.bodyFat)).toFixed(1)}% BF
                    </span>
                  </div>
                  <div className="text-sm font-medium text-green-500">
                    {(parseFloat(analyticsData.journey.progressPhotos.start.metrics.weight) - 
                      parseFloat(analyticsData.journey.progressPhotos.current.metrics.weight)).toFixed(1)}kg
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total Progress</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {analyticsData.journey.progressPhotos.current.metrics.weight}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {analyticsData.journey.progressPhotos.current.metrics.bodyFat} BF
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(analyticsData.journey.progressPhotos.current.date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Photo Comparisons */}
              <div className="space-y-8">
                {/* Front View */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Front View</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative aspect-square">
                      <Image
                        src={analyticsData.journey.progressPhotos.start.photos.front}
                        alt="Front view - Start"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">
                        Start
                      </div>
                    </div>
                    <div className="relative aspect-square">
                      <Image
                        src={analyticsData.journey.progressPhotos.current.photos.front}
                        alt="Front view - Current"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">
                        Current
                      </div>
                    </div>
                  </div>
                </div>

                {/* Back View */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Back View</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative aspect-square">
                      <Image
                        src={analyticsData.journey.progressPhotos.start.photos.back}
                        alt="Back view - Start"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">
                        Start
                      </div>
                    </div>
                    <div className="relative aspect-square">
                      <Image
                        src={analyticsData.journey.progressPhotos.current.photos.back}
                        alt="Back view - Current"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">
                        Current
                      </div>
                    </div>
                  </div>
                </div>

                {/* Side View */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Side View</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative aspect-square">
                      <Image
                        src={analyticsData.journey.progressPhotos.start.photos.side}
                        alt="Side view - Start"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">
                        Start
                      </div>
                    </div>
                    <div className="relative aspect-square">
                      <Image
                        src={analyticsData.journey.progressPhotos.current.photos.side}
                        alt="Side view - Current"
                        fill
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded z-10">
                        Current
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download/Share Options */}
              <div className="mt-6 flex justify-end gap-4">
                <button className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                  <PhotoIcon className="h-5 w-5" />
                  Download All
                </button>
                <button className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                  <ShareIcon className="h-5 w-5" />
                  Share All
                </button>
              </div>
            </div>

            {/* Social Media Content */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Social Media Content
                </h3>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                  <ShareIcon className="h-5 w-5" />
                  Share Story
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300">
                    {analyticsData.aiInsights.socialHighlights.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analyticsData.aiInsights.socialHighlights.stats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {analyticsData.aiInsights.socialHighlights.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <>
            {/* Filters */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search check-ins..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="week">Sort by Week</option>
              </select>
              <button
                onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
              </button>
            </div>

            {/* Check-ins Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHistory.map((checkIn) => (
                <Link
                  key={checkIn.id}
                  href={`/coach/check-ins/review/${checkIn.id}`}
                  className="block"
                >
                  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow ${
                    checkIn.status === 'missed' ? 'border-2 border-gray-300 dark:border-gray-600' : ''
                  }`}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              Week {checkIn.week}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(checkIn.date), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                        {checkIn.status !== 'missed' && (
                          <div className="flex items-center gap-2">
                            <ChartBarIcon className="h-5 w-5 text-gray-400" />
                            <span className={`text-sm font-medium ${getComplianceColor(checkIn.score)}`}>
                              {checkIn.score}%
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Metrics */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {Object.entries(checkIn.metrics).map(([key, metric]) => (
                          <div key={key} className="text-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {key}
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {metric.value.toFixed(1)}
                            </div>
                            <div className={`text-xs ${
                              metric.change > 0 ? 'text-green-500' : metric.change < 0 ? 'text-red-500' : 'text-gray-500'
                            }`}>
                              {metric.change > 0 ? '+' : ''}{metric.change.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Summary */}
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                        {checkIn.summary}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function getComplianceColor(score: number) {
  if (score >= 90) return 'text-green-500';
  if (score >= 75) return 'text-yellow-500';
  return 'text-red-500';
} 