'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCoaches, getClientsByCoach, type Client, type Coach } from '@/lib/services/firebaseService';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { DashboardNav } from '@/components/DashboardNav';
import {
  CalendarIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  FireIcon,
  TrophyIcon,
  HeartIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  DocumentCheckIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  SpeakerWaveIcon,
  PaperClipIcon,
  CheckCircleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  UserIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  SparklesIcon,
  LightBulbIcon,
  UserCircleIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { LastLoginBadge } from '@/components/ui/LastLoginBadge';
import type { ReactElement } from 'react';

interface ClientWithStats extends Client {
  stats?: {
    completionRate: number;
    lastActivity: Date;
    progress: 'improving' | 'steady' | 'declining';
  };
}

interface ClientUpdate {
  id: string;
  name: string;
  goals: string[];
  status: 'Active Client' | 'On Hold' | 'Completed';
}

interface AIInsight {
  title: string;
  description: string;
  trend: 'up' | 'down' | 'neutral';
  percentage?: number;
  metric?: string;
}

const mockClients: ClientUpdate[] = [
  {
    id: '1',
    name: 'Sarah Wilson',
    goals: ['Weight Loss', 'Muscle Tone', 'Better Energy'],
    status: 'Active Client'
  },
  {
    id: '2',
    name: 'Mike Johnson',
    goals: ['Strength Training', 'Nutrition Planning'],
    status: 'Active Client'
  },
  {
    id: '3',
    name: 'Emma Davis',
    goals: ['Stress Management', 'Flexibility'],
    status: 'Active Client'
  }
];

const mockIndividualInsights: { [key: string]: AIInsight[] } = {
  '1': [
    {
      title: 'Consistency Improvement',
      description: 'Sarah has maintained a 90% check-in rate over the last month, showing strong commitment to her goals.',
      trend: 'up',
      percentage: 90
    },
    {
      title: 'Weight Loss Progress',
      description: 'Steady progress with 1.5kg loss in the last 2 weeks while maintaining muscle mass.',
      trend: 'up',
      metric: '-1.5kg'
    },
    {
      title: 'Energy Levels',
      description: 'Morning energy scores have improved by 40% since implementing the new sleep routine.',
      trend: 'up',
      percentage: 40
    }
  ],
  '2': [
    {
      title: 'Strength Gains',
      description: 'Mike has increased his compound lift numbers by 15% in the past month.',
      trend: 'up',
      percentage: 15
    },
    {
      title: 'Nutrition Adherence',
      description: 'Protein intake goals met 85% of days, slight decrease from last week.',
      trend: 'down',
      percentage: 85
    }
  ],
  '3': [
    {
      title: 'Stress Management',
      description: "Emma's stress scores have decreased by 30% since starting meditation practice.",
      trend: 'down',
      percentage: 30
    },
    {
      title: 'Flexibility Progress',
      description: 'Mobility assessments show 25% improvement in hip flexor range.',
      trend: 'up',
      percentage: 25
    }
  ]
};

const mockGroupInsights: AIInsight[] = [
  {
    title: 'Overall Engagement',
    description: 'Group check-in completion rate is at 85%, up 10% from last month.',
    trend: 'up',
    percentage: 85
  },
  {
    title: 'Common Challenge',
    description: '60% of clients report difficulty maintaining evening routines. Consider group workshop on night-time habits.',
    trend: 'down',
    percentage: 60
  },
  {
    title: 'Success Pattern',
    description: 'Clients using the morning check-in reminder are 40% more likely to stay consistent.',
    trend: 'up',
    percentage: 40
  },
  {
    title: 'Nutrition Trend',
    description: 'Group averaging 80% adherence to meal plans, stable from previous week.',
    trend: 'neutral',
    percentage: 80
  }
];

export default function Dashboard(): ReactElement {
  const { user } = useAuth();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activeClients: 0,
    pendingResponses: 0,
    completionRate: 0,
    revenue: 0,
    clientProgress: {
      improving: 0,
      steady: 0,
      declining: 0,
    }
  });
  const [selectedClient, setSelectedClient] = useState<string | null>(null);

  useEffect(() => {
    loadCoachData();
  }, []);

  const loadCoachData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all coaches and find the one matching the logged-in user's email
      const coaches = await getCoaches();
      const coachData = coaches.find(c => c.email === user?.email) || coaches[0];

      if (!coachData) {
        setError('Coach not found');
        return;
      }

      console.log('Coach data loaded:', coachData);
      setCoach(coachData);

      const clientsData = await getClientsByCoach(coachData.id!);
      console.log('Clients loaded:', clientsData);
      setClients(clientsData);

      // Calculate stats based on clients data
      const pendingResponses = clientsData.reduce((count, client) => {
        return count + Math.floor(Math.random() * 3);
      }, 0);

      const completionRate = clientsData.length > 0 
        ? Math.round((clientsData.filter(client => client.goals?.length > 0).length / clientsData.length) * 100)
        : 0;

      const revenue = clientsData.length * 100;
      const improving = Math.floor(clientsData.length * 0.6);
      const steady = Math.floor(clientsData.length * 0.3);
      const declining = clientsData.length - improving - steady;

      setStats({
        activeClients: clientsData.length,
        pendingResponses,
        completionRate,
        revenue,
        clientProgress: {
          improving,
          steady,
          declining,
        }
      });
    } catch (error) {
      console.error('Error loading coach data:', error);
      setError('Failed to load coach data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="w-4 h-4 text-red-500" />;
      case 'neutral':
        return <MinusIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading coach dashboard...
        </div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">
          {error || 'Coach not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <DashboardNav />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Coach Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/coach/templates"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PencilSquareIcon className="w-4 h-4 mr-2" />
              Manage Check-in Templates
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Clients</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.activeClients}</h3>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Responses</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pendingResponses}</h3>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <ChatBubbleLeftRightIcon className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
                Requires attention
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.completionRate}%</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <DocumentCheckIcon className="h-6 w-6 text-emerald-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                On track
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${stats.revenue}</h3>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Based on active clients
              </span>
            </div>
          </div>
        </div>

        {/* Client Progress Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Client Progress Overview</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Last 30 days</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Improving</span>
                <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                {stats.clientProgress.improving}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Steady</span>
                <ChartBarIcon className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {stats.clientProgress.steady}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-500/10">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Needs Focus</span>
                <HeartIcon className="h-4 w-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
                {stats.clientProgress.declining}
              </p>
            </div>
          </div>
        </div>

        {/* Group AI Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <SparklesIcon className="w-6 h-6 text-indigo-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Group AI Insights
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mockGroupInsights.map((insight, index) => (
                <div 
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {insight.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {insight.percentage && (
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {insight.percentage}%
                        </span>
                      )}
                      {getTrendIcon(insight.trend)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Client Updates with AI Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Client Updates
              </h2>
              <button className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:text-indigo-500">
                View All
              </button>
            </div>
            <div className="space-y-6">
              {mockClients.map((client) => (
                <div key={client.id} className="space-y-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setSelectedClient(selectedClient === client.id ? null : client.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <UserCircleIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {client.name}
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {client.goals.map((goal, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md"
                            >
                              {goal}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {client.status}
                    </span>
                  </div>

                  {/* Individual AI Insights */}
                  {selectedClient === client.id && mockIndividualInsights[client.id] && (
                    <div className="ml-14 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {mockIndividualInsights[client.id].map((insight, index) => (
                        <div 
                          key={index}
                          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <LightBulbIcon className="w-4 h-4 text-yellow-500" />
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {insight.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2">
                              {insight.percentage && (
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {insight.percentage}%
                                </span>
                              )}
                              {insight.metric && (
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {insight.metric}
                                </span>
                              )}
                              {getTrendIcon(insight.trend)}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {insight.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium">Recent Clients</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Check-in
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full"
                            src={client.avatar || '/default-avatar.png'}
                            alt=""
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {client.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {client.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <LastLoginBadge lastLoginAt={client.lastLoginAt || null} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <LastLoginBadge lastLoginAt={client.lastCheckIn || null} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {client.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3">
                        View
                      </button>
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                        Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 