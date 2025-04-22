'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FunnelIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

// Mock data for check-ins
const MOCK_CHECKINS = [
  {
    id: 'check-1',
    clientId: 'client-1',
    clientName: 'Sarah Johnson',
    clientAvatar: 'https://i.pravatar.cc/150?img=1',
    submittedAt: new Date(2024, 2, 15, 9, 30),
    status: 'pending',
    complianceScore: 85,
    metrics: {
      weight: { value: 68.5, unit: 'kg', change: -0.5 },
      bodyFat: { value: 22, unit: '%', change: -0.3 },
      energy: { value: 8, unit: '/10', change: 1 },
    },
    summary: 'Completed all workouts, following nutrition plan well',
    hasPhotos: true,
    urgency: 'high',
  },
  {
    id: 'check-2',
    clientId: 'client-2',
    clientName: 'Michael Chen',
    clientAvatar: 'https://i.pravatar.cc/150?img=2',
    submittedAt: new Date(2024, 2, 15, 8, 15),
    status: 'reviewed',
    complianceScore: 92,
    metrics: {
      weight: { value: 75.0, unit: 'kg', change: 0 },
      bodyFat: { value: 18, unit: '%', change: -0.5 },
      energy: { value: 9, unit: '/10', change: 0 },
    },
    summary: 'Great progress this week, hitting all targets',
    hasPhotos: false,
    urgency: 'medium',
  },
  {
    id: 'check-3',
    clientId: 'client-3',
    clientName: 'Emma Wilson',
    clientAvatar: 'https://i.pravatar.cc/150?img=3',
    submittedAt: new Date(2024, 2, 14, 18, 45),
    status: 'pending',
    complianceScore: 78,
    metrics: {
      weight: { value: 62.0, unit: 'kg', change: 0.5 },
      bodyFat: { value: 24, unit: '%', change: 0 },
      energy: { value: 6, unit: '/10', change: -1 },
    },
    summary: 'Struggling with evening cravings, need guidance',
    hasPhotos: true,
    urgency: 'high',
  },
  {
    id: 'check-4',
    clientId: 'client-4',
    clientName: 'David Brown',
    clientAvatar: 'https://i.pravatar.cc/150?img=4',
    submittedAt: new Date(2024, 2, 14, 16, 20),
    status: 'completed',
    complianceScore: 95,
    metrics: {
      weight: { value: 82.5, unit: 'kg', change: -1.0 },
      bodyFat: { value: 20, unit: '%', change: -0.8 },
      energy: { value: 9, unit: '/10', change: 2 },
    },
    summary: 'Best week yet! Feeling stronger and more energetic',
    hasPhotos: true,
    urgency: 'low',
  },
  {
    id: 'check-5',
    clientId: 'client-5',
    clientName: 'Lisa Martinez',
    clientAvatar: 'https://i.pravatar.cc/150?img=5',
    submittedAt: new Date(2024, 2, 14, 15, 10),
    status: 'pending',
    complianceScore: 72,
    metrics: {
      weight: { value: 65.5, unit: 'kg', change: 1.0 },
      bodyFat: { value: 25, unit: '%', change: 0.5 },
      energy: { value: 5, unit: '/10', change: -2 },
    },
    summary: 'Missed workouts due to work stress, need to adjust schedule',
    hasPhotos: false,
    urgency: 'medium',
  },
];

export default function CheckInsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'urgency' | 'compliance'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort check-ins
  const filteredCheckIns = MOCK_CHECKINS
    .filter(checkIn => {
      const matchesSearch = checkIn.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        checkIn.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || checkIn.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = b.submittedAt.getTime() - a.submittedAt.getTime();
      } else if (sortBy === 'urgency') {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        comparison = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      } else if (sortBy === 'compliance') {
        comparison = b.complianceScore - a.complianceScore;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Check-ins
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Review and respond to client check-ins
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search check-ins..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        if (sortBy === 'date') {
                          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('date');
                          setSortOrder('desc');
                        }
                      }}
                      className="group inline-flex items-center"
                    >
                      Submitted
                      <span className="ml-2">
                        {sortBy === 'date' ? (
                          sortOrder === 'asc' ? (
                            <ChevronUpIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                          )
                        ) : (
                          <ChevronDownIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        if (sortBy === 'urgency') {
                          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('urgency');
                          setSortOrder('desc');
                        }
                      }}
                      className="group inline-flex items-center"
                    >
                      Urgency
                      <span className="ml-2">
                        {sortBy === 'urgency' ? (
                          sortOrder === 'asc' ? (
                            <ChevronUpIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                          )
                        ) : (
                          <ChevronDownIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <button
                      onClick={() => {
                        if (sortBy === 'compliance') {
                          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortBy('compliance');
                          setSortOrder('desc');
                        }
                      }}
                      className="group inline-flex items-center"
                    >
                      Compliance
                      <span className="ml-2">
                        {sortBy === 'compliance' ? (
                          sortOrder === 'asc' ? (
                            <ChevronUpIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                          ) : (
                            <ChevronDownIcon className="h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                          )
                        ) : (
                          <ChevronDownIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" />
                        )}
                      </span>
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCheckIns.map((checkIn) => (
                  <tr key={checkIn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            src={checkIn.clientAvatar}
                            alt={checkIn.clientName}
                            className="h-10 w-10 rounded-full"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {checkIn.clientName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            {checkIn.summary}
                            {checkIn.hasPhotos && (
                              <PhotoIcon className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(checkIn.submittedAt, 'MMM d, h:mm a')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getUrgencyIcon(checkIn.urgency)}
                        <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                          {checkIn.urgency}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getComplianceColor(checkIn.complianceScore)}`}>
                        {checkIn.complianceScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(checkIn.status)}`}>
                        {checkIn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/coach/check-ins/review/${checkIn.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                      >
                        Review
                      </Link>
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