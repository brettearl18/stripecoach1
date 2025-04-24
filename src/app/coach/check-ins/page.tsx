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
} from '@heroicons/react/24/outline';
import { getCheckIns, getClientById, type CheckIn, type Client } from '@/lib/services/firebaseService';
import { DataTable } from '@/components/admin/DataTable';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import Link from 'next/link';

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

  useEffect(() => {
    if (user) {
      loadCheckIns();
    }
  }, [user]);

  const loadCheckIns = async () => {
    if (!user?.uid) return;
    
    try {
      setIsLoading(true);
      const checkInsData = await getCheckIns(user.uid); // Only get check-ins for this coach
      
      // Fetch client data for each check-in
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
            <input
              type="text"
              placeholder="Search check-ins..."
              className="px-4 py-2 rounded-lg bg-[#1a1b1e] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="px-4 py-2 rounded-lg bg-[#1a1b1e] border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Check-Ins</p>
                <h3 className="text-2xl font-bold text-white mt-1">{totalCheckIns}</h3>
                <p className="text-green-500 text-sm mt-1">
                  +{checkIns.filter(c => new Date(c.submittedAt).toDateString() === new Date().toDateString()).length} today
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Review</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {pendingReviews}
                </h3>
                <p className="text-yellow-500 text-sm mt-1">Requires attention</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Average Score</p>
                <h3 className="text-2xl font-bold text-white mt-1">{averageCompliance}/100</h3>
                <p className="text-green-500 text-sm mt-1">+5.3 this week</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1b1e] rounded-lg p-6">
          <DataTable
            columns={[
              {
                header: 'Client',
                key: 'client',
                render: (client, checkIn) => (
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
                      <UserCircleIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{client?.name || 'Unknown Client'}</div>
                      <div className="text-sm text-gray-400">{checkIn.summary}</div>
                    </div>
                  </div>
                )
              },
              {
                header: 'Date',
                key: 'date',
                render: (date) => (
                  <span className="text-gray-300">{new Date(date).toLocaleDateString()}</span>
                )
              },
              {
                header: 'Status',
                key: 'status',
                render: (status) => (
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(status)}`}>
                    {status}
                  </span>
                )
              }
            ]}
            data={filteredCheckIns}
            actions={(checkIn) => (
              <div className="flex space-x-2">
                <button 
                  onClick={() => window.location.href = `/coach/check-ins/${checkIn.id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
                >
                  View Details
                </button>
                {checkIn.status === 'pending' && (
                  <button 
                    onClick={() => {/* TODO: Implement mark as reviewed */}}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
                  >
                    Mark as Reviewed
                  </button>
                )}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
} 