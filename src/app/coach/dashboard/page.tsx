'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getClientsByCoach, type Client, type Coach, getCoach, getCoaches } from '@/lib/services/firebaseService';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';
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
} from '@heroicons/react/24/outline';
import { LastLoginBadge } from '@/components/ui/LastLoginBadge';

interface ClientWithSubmissions extends Client {
  submissions: FormSubmission[];
  latestSubmission?: FormSubmission;
}

export default function CoachDashboard() {
  const searchParams = useSearchParams();
  const coachId = searchParams.get('id');
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

  useEffect(() => {
    loadCoachData();
  }, [coachId]);

  const loadCoachData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let coachData: Coach | null = null;
      
      if (coachId) {
        coachData = await getCoach(coachId);
      } else {
        // If no coach ID provided, get the first coach from mock data
        const coaches = await getCoaches();
        coachData = coaches[0] || null;
      }

      if (!coachData) {
        setError('Coach not found');
        return;
      }

      setCoach(coachData);
      const clientsData = await getClientsByCoach(coachData.id!);
      setClients(clientsData);

      // Calculate stats based on clients data
      const pendingResponses = clientsData.reduce((count, client) => {
        // TODO: Implement actual pending responses count
        return count + Math.floor(Math.random() * 3); // Temporary random number for demo
      }, 0);

      const completionRate = clientsData.length > 0 
        ? Math.round((clientsData.filter(client => client.goals?.length > 0).length / clientsData.length) * 100)
        : 0;

      // Temporary revenue calculation
      const revenue = clientsData.length * 100; // $100 per client

      // Temporary client progress calculation
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
      {/* Top Navigation Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Coach Dashboard</h1>
                <p className="text-sm text-gray-500">{coach.name}</p>
              </div>
              <nav className="hidden md:flex space-x-1">
                <a 
                  href="/coach/dashboard" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/80 transition-colors"
                >
                  Dashboard
                </a>
                <a 
                  href="/coach/clients" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Clients
                </a>
                <a 
                  href="/coach/responses" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative"
                >
                  Responses
                  <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full">
                    {stats.pendingResponses}
                  </span>
                </a>
                <a 
                  href="/coach/dashboard/analytics" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Analytics
                </a>
                <a 
                  href="/coach/settings" 
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  Settings
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white relative">
                <BellIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center bg-red-500 text-white text-xs font-medium rounded-full">3</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Recent Client Updates */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Client Updates</h2>
              <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">View All</button>
            </div>
            <div className="space-y-4">
              {clients.slice(0, 5).map((client) => (
                <div key={client.id} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <UserIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 dark:text-white">{client.name}</h3>
                      <span className="text-sm text-gray-500">Active Client</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {(client.goals || []).map((goal, index) => (
                          <span key={index} className="text-sm bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3">
                      <Link 
                        href={`/coach/clients/${client.id}`}
                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* ... existing stats cards ... */}
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
                      <LastLoginBadge lastLoginAt={client.lastLoginAt} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <LastLoginBadge lastLoginAt={client.lastCheckIn} />
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