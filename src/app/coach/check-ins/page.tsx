'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  UserGroupIcon,
  ClockIcon,
  UserCircleIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  DocumentPlusIcon,
  ChevronDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CameraIcon,
  ChevronUpIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  TrophyIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { getCheckIns, getClientById, type CheckIn, type Client } from '@/lib/services/firebaseService';
import { DataTable } from '@/components/admin/DataTable';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import Link from 'next/link';
import { analyticsService } from '@/lib/services/database';

interface CheckInWithClient extends CheckIn {
  client?: Client | null;
}

interface CheckInTemplate {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  questions: {
    id: string;
    type: 'text' | 'number' | 'scale' | 'options';
    question: string;
    required: boolean;
    options?: string[];
  }[];
  assignedClients: number;
  lastUpdated: string;
}

// Add AIAnalysis type for group insights
interface AIAnalysis {
  overallMood: Array<{ category: string; score: number; trend: string; change: number }>;
  recentWins: string[];
  commonChallenges: string[];
  insights: Array<{ type: string; message: string; impact: string }>;
  focusAreas: string[];
}

// Mock data for development
const mockCheckIns: CheckIn[] = [
  {
    id: '1',
    clientId: 'sarah-johnson',
    clientName: 'Sarah Johnson',
    clientAvatar: '/avatars/sarah.jpg',
    status: 'pending',
    submittedAt: '2024-03-15T09:30:00Z',
    summary: 'Completed all workouts, following nutrition plan well',
    urgency: 'high',
    compliance: 85,
    hasPhotos: true
  },
  {
    id: '2',
    clientId: 'michael-chen',
    clientName: 'Michael Chen',
    clientAvatar: '/avatars/michael.jpg',
    status: 'reviewed',
    submittedAt: '2024-03-15T08:15:00Z',
    summary: 'Great progress this week, hitting all targets',
    urgency: 'medium',
    compliance: 92,
    hasPhotos: true
  },
  {
    id: '3',
    clientId: 'emma-wilson',
    clientName: 'Emma Wilson',
    clientAvatar: '/avatars/emma.jpg',
    status: 'pending',
    submittedAt: '2024-03-14T18:45:00Z',
    summary: 'Struggling with evening cravings, need guidance',
    urgency: 'high',
    compliance: 78,
    hasPhotos: true
  },
  {
    id: '4',
    clientId: 'david-brown',
    clientName: 'David Brown',
    clientAvatar: '/avatars/david.jpg',
    status: 'completed',
    submittedAt: '2024-03-14T16:20:00Z',
    summary: 'Best week yet! Feeling stronger and more energetic',
    urgency: 'low',
    compliance: 95,
    hasPhotos: true
  },
  {
    id: '5',
    clientId: 'lisa-martinez',
    clientName: 'Lisa Martinez',
    clientAvatar: '/avatars/lisa.jpg',
    status: 'pending',
    submittedAt: '2024-03-14T15:10:00Z',
    summary: 'Missed workouts due to work stress, need to adjust schedule',
    urgency: 'medium',
    compliance: 72,
    hasPhotos: false
  }
];

const mockTemplates: CheckInTemplate[] = [
  {
    id: '1',
    name: 'Weekly Progress Check',
    description: 'Track weekly progress including workouts, nutrition, and overall wellbeing',
    frequency: 'weekly',
    questions: [
      {
        id: 'q1',
        type: 'scale',
        question: 'How was your energy level this week? (1-5)',
        required: true
      },
      {
        id: 'q2',
        type: 'text',
        question: 'What challenges did you face this week?',
        required: true
      }
    ],
    assignedClients: 12,
    lastUpdated: '2024-03-10T15:00:00Z'
  },
  {
    id: '2',
    name: 'Daily Nutrition Log',
    description: 'Track daily nutrition habits and water intake',
    frequency: 'daily',
    questions: [
      {
        id: 'q1',
        type: 'options',
        question: 'Did you follow your meal plan today?',
        required: true,
        options: ['Yes, completely', 'Mostly', 'Partially', 'No']
      },
      {
        id: 'q2',
        type: 'number',
        question: 'How many liters of water did you drink?',
        required: true
      }
    ],
    assignedClients: 8,
    lastUpdated: '2024-03-12T09:00:00Z'
  }
];

export default function CoachCheckIns() {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>(mockCheckIns);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'urgency' | 'compliance'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<'responses' | 'templates'>('responses');
  const [aiInsights, setAiInsights] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadCheckIns();
      loadAIInsights();
    }
  }, [user]);

  const loadCheckIns = async () => {
    if (!user?.uid) return;
    try {
      setIsLoading(true);
      const checkInsData = await getCheckIns(user.uid); // Only get check-ins for this coach
      const checkInsWithClients = await Promise.all(
        checkInsData.map(async (checkIn) => {
          let client = null;
          if (checkIn.clientId) {
            try {
              client = await getClientById(checkIn.clientId);
            } catch (error) {
              console.error(`Error fetching client for check-in ${checkIn.id}:`, error);
            }
          }
          return {
            ...checkIn,
            client
          };
        })
      );
      setCheckIns(checkInsWithClients);
    } catch (error) {
      console.error('Error loading check-ins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recent check-ins and AI insights for the coach
  const loadAIInsights = async () => {
    if (!user?.uid) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const recentCheckIns = await analyticsService.getRecentCheckInsForCoach(user.uid, 14);
      if (!recentCheckIns.length) throw new Error('No recent check-ins found');
      const res = await fetch('/api/coach/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIns: recentCheckIns, analysisType: 'group' })
      });
      if (!res.ok) throw new Error('Failed to fetch AI insights');
      const data = await res.json();
      setAiInsights(data.insights);
    } catch (error: any) {
      setAiError(error.message || 'Failed to load AI insights');
    } finally {
      setAiLoading(false);
    }
  };

  const filteredCheckIns = checkIns
    .filter(checkIn => {
      const matchesSearch = checkIn.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        checkIn.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || checkIn.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortField) {
        case 'date':
          return sortDirection === 'desc'
            ? new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
            : new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        case 'urgency': {
          const urgencyScore = { high: 3, medium: 2, low: 1 };
          return sortDirection === 'desc'
            ? urgencyScore[b.urgency] - urgencyScore[a.urgency]
            : urgencyScore[a.urgency] - urgencyScore[b.urgency];
        }
        case 'compliance':
          return sortDirection === 'desc'
            ? b.compliance - a.compliance
            : a.compliance - b.compliance;
        default:
          return 0;
      }
    });

  const handleSort = (field: 'date' | 'urgency' | 'compliance') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getUrgencyColor = (urgency: CheckIn['urgency']) => {
    switch (urgency) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusColor = (status: CheckIn['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'reviewed':
        return 'bg-blue-500/10 text-blue-500';
      case 'completed':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  // Calculate metrics
  const totalCheckIns = checkIns.length;
  const pendingReviews = checkIns.filter(c => c.status === 'pending').length;
  const averageCompliance = Math.round(
    checkIns.reduce((acc, curr) => acc + curr.compliance, 0) / totalCheckIns
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#13141A] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <ArrowPathIcon className="w-5 h-5 animate-spin" />
          Loading check-ins...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#13141A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Client Check-Ins</h1>
            <p className="text-gray-400">Monitor and review your client check-ins</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('responses')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'responses'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Responses
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'templates'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Templates
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1b1e] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Business Overview</h3>
              <SparklesIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  aiInsights?.businessOverview.health === 'positive' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm text-gray-400">Overall Health</span>
              </div>
              <div className="space-y-2">
                {aiInsights?.businessOverview.trends.map((trend, index) => (
                  <p key={index} className="text-sm text-gray-300">{trend}</p>
                ))}
              </div>
              {aiInsights?.businessOverview.alerts.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-800">
                  <p className="text-sm text-red-400 font-medium">Alerts</p>
                  <ul className="mt-2 space-y-1">
                    {aiInsights?.businessOverview.alerts.map((alert, index) => (
                      <li key={index} className="text-sm text-red-400">{alert}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Client Overview</h3>
              <UserGroupIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(aiInsights?.clientOverview.segmentation || {}).map(([key, value]) => (
                <div key={key} className="bg-[#23242a] rounded-lg p-3">
                  <p className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-xl font-semibold text-white mt-1">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-sm text-gray-400 mb-2">Recent Trends</p>
              <ul className="space-y-1">
                {aiInsights?.clientOverview.trends.map((trend, index) => (
                  <li key={index} className="text-sm text-gray-300">{trend}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Client of the Week</h3>
              <TrophyIcon className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-medium">
                  {aiInsights?.clientOfTheWeek.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-white">{aiInsights?.clientOfTheWeek.name}</p>
                  <p className="text-sm text-gray-400">{aiInsights?.clientOfTheWeek.achievement}</p>
                </div>
              </div>
              <p className="text-sm text-gray-300">{aiInsights?.clientOfTheWeek.summary}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1b1e] rounded-xl p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search check-ins..."
                className="px-4 py-2 rounded-lg bg-[#23242a] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select
                className="px-4 py-2 rounded-lg bg-[#23242a] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <button
              onClick={() => {/* TODO: Implement refresh */}}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-800">
                  <th className="pb-4 text-sm font-medium text-gray-400">Client</th>
                  <th className="pb-4 text-sm font-medium text-gray-400">Date</th>
                  <th className="pb-4 text-sm font-medium text-gray-400">Status</th>
                  <th className="pb-4 text-sm font-medium text-gray-400">Urgency</th>
                  <th className="pb-4 text-sm font-medium text-gray-400">Compliance</th>
                  <th className="pb-4 text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredCheckIns.map((checkIn) => (
                  <tr key={checkIn.id} className="hover:bg-[#23242a] transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                          {checkIn.clientName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{checkIn.clientName}</p>
                          <p className="text-sm text-gray-400">{checkIn.summary}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-gray-300">
                      {new Date(checkIn.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(checkIn.status)}`}>
                        {checkIn.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`flex items-center gap-1 ${getUrgencyColor(checkIn.urgency)}`}>
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        {checkIn.urgency}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${checkIn.compliance}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-300">{checkIn.compliance}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/coach/check-ins/review/${checkIn.id}`}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                          Review
                        </Link>
                        {checkIn.hasPhotos && (
                          <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
                            <PhotoIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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