'use client';

import { useState, useEffect } from 'react';
import {
  ClockIcon,
  PhotoIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// Timeline data with compliance colors
const timelineData = {
  totalWeeks: 12,
  currentWeek: 6,
  checkInDays: [1, 4], // Monday and Thursday
  nextCheckIn: '2024-03-21T09:00:00Z',
  programName: 'Weight Loss & Strength - Phase 2',
  weeklyCompliance: [
    { week: 1, compliance: 'low' },     // red
    { week: 2, compliance: 'medium' },  // yellow
    { week: 3, compliance: 'low' },     // red
    { week: 4, compliance: 'medium' },  // yellow
    { week: 5, compliance: 'low' },     // red
    { week: 6, compliance: 'medium' },  // yellow
    { week: 7, compliance: 'high' },    // green
    { week: 8, compliance: 'medium' },  // yellow
    { week: 9, compliance: 'high' },    // green
  ]
};

// Mock check-ins data for David Rodriguez only
const mockCheckIns = [
  {
    id: 1,
    submittedAt: '2024-03-18T10:30:00Z',
    summary: 'Weekly check-in with updated progress photos and measurements.',
    status: 'pending',
    urgency: 'medium',
    compliance: 85,
    hasPhotos: true,
    feedback: null,
    week: 6,
  },
  {
    id: 2,
    submittedAt: '2024-03-11T09:15:00Z',
    summary: 'Weekly progress update and nutrition tracking.',
    status: 'completed',
    urgency: 'low',
    compliance: 92,
    hasPhotos: true,
    feedback: "Great progress this week! Your nutrition adherence is improving and it's showing in your measurements. Keep focusing on protein intake and hydration.",
    week: 5,
  },
  {
    id: 3,
    submittedAt: '2024-03-04T11:30:00Z',
    summary: 'Monthly measurements and progress photos.',
    status: 'completed',
    urgency: 'medium',
    compliance: 88,
    hasPhotos: true,
    feedback: "Good work on maintaining consistency with your workouts. Let's work on increasing your daily step count this week.",
    week: 4,
  },
  {
    id: 4,
    submittedAt: '2024-02-26T14:20:00Z',
    summary: 'Weekly check-in and workout feedback.',
    status: 'completed',
    urgency: 'low',
    compliance: 90,
    hasPhotos: false,
    feedback: "Excellent form on your compound lifts. Recovery looks good, and sleep quality has improved.",
    week: 3,
  }
];

// Timeline Component
const ProgramTimeline = ({ data }: { data: typeof timelineData }) => {
  const weeks = Array.from({ length: data.totalWeeks }, (_, i) => i + 1);
  const nextCheckInDate = new Date(data.nextCheckIn);
  const daysUntilNext = Math.ceil((nextCheckInDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const getComplianceColor = (week: number) => {
    const weekData = data.weeklyCompliance.find(w => w.week === week);
    if (!weekData) return 'bg-gray-700'; // Future weeks
    
    switch (weekData.compliance) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-700';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">{data.programName}</h2>
          <p className="text-gray-400 mt-1">Week {data.currentWeek} of {data.totalWeeks}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-white">Next Check-in</p>
          <p className="text-sm text-gray-400">
            {nextCheckInDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            {daysUntilNext <= 7 && (
              <span className="ml-2 text-green-400">({daysUntilNext} days)</span>
            )}
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Timeline bar */}
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden flex">
          {weeks.map((week) => (
            <div
              key={week}
              className={`h-full flex-1 ${getComplianceColor(week)} ${
                week > 1 ? 'border-l border-gray-800' : ''
              }`}
            />
          ))}
        </div>

        {/* Week labels */}
        <div className="flex justify-between mt-2">
          <div className="text-xs text-gray-400">Week 1</div>
          <div className="text-xs text-gray-400">Week {Math.floor(data.totalWeeks / 2)}</div>
          <div className="text-xs text-gray-400">Week {data.totalWeeks}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-400">Check-in days: Monday, Thursday</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-400">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-400">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-400">Low</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats Component
const CheckInStats = ({ checkIns }: { checkIns: typeof mockCheckIns }) => {
  const totalCheckIns = checkIns.length;
  const completedCheckIns = checkIns.filter(c => c.status === 'completed').length;
  const averageCompliance = Math.round(
    checkIns.reduce((acc, curr) => acc + curr.compliance, 0) / totalCheckIns
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Check-ins</p>
            <p className="text-2xl font-bold text-white mt-1">{totalCheckIns}</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <ClockIcon className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-2xl font-bold text-white mt-1">{completedCheckIns}</p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg">
            <CheckCircleIcon className="h-6 w-6 text-green-400" />
          </div>
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Avg. Compliance</p>
            <p className="text-2xl font-bold text-white mt-1">{averageCompliance}%</p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <ChartBarIcon className="h-6 w-6 text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CheckInsPage() {
  const [loading, setLoading] = useState(true);
  const [checkIns, setCheckIns] = useState(mockCheckIns);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Filter check-ins based on search query and status
  const filteredCheckIns = checkIns
    .filter(checkIn => {
      const matchesSearch = checkIn.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || checkIn.status === selectedStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          return getUrgencyScore(b.urgency) - getUrgencyScore(a.urgency);
        case 'compliance':
          return b.compliance - a.compliance;
        default:
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
    });

  function getUrgencyScore(urgency: string) {
    switch (urgency) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">My Check-ins</h1>
          <p className="text-gray-400 mt-1">Track your progress and view coach feedback</p>
        </div>

        {/* Timeline */}
        <ProgramTimeline data={timelineData} />

        {/* Stats */}
        <CheckInStats checkIns={checkIns} />

        {/* Filters and Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search check-ins..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <select
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <select
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="urgency">Sort by Priority</option>
              <option value="compliance">Sort by Compliance</option>
            </select>
          </div>
        </div>

        {/* Updated Check-ins List */}
        <div className="space-y-3">
          {filteredCheckIns.map((checkIn) => (
            <Link 
              href={`/client/check-ins/${checkIn.id}`}
              key={checkIn.id}
              className="block"
            >
              <div className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer overflow-hidden">
                <div className="flex items-center">
                  {/* Left Status Bar */}
                  <div className={`w-1 self-stretch ${
                    checkIn.status === 'pending' 
                      ? 'bg-yellow-500' 
                      : checkIn.status === 'completed'
                      ? 'bg-green-500'
                      : 'bg-gray-600'
                  }`} />

                  {/* Main Content */}
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">
                          {new Date(checkIn.submittedAt).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <div className="flex items-center gap-2">
                          {checkIn.hasPhotos && (
                            <PhotoIcon className="h-4 w-4 text-purple-400" />
                          )}
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                            checkIn.urgency === 'high' 
                              ? 'bg-red-500/10 text-red-400'
                              : checkIn.urgency === 'medium'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : 'bg-green-500/10 text-green-400'
                          }`}>
                            {checkIn.urgency.charAt(0).toUpperCase() + checkIn.urgency.slice(1)}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-400">
                            {checkIn.compliance}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          checkIn.status === 'pending' 
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-green-500/10 text-green-500'
                        }`}>
                          {checkIn.status.charAt(0).toUpperCase() + checkIn.status.slice(1)}
                        </span>
                        <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <h3 className="text-sm text-white font-medium mb-2">{checkIn.summary}</h3>
                    
                    {checkIn.feedback && (
                      <div className="mt-2 text-sm">
                        <p className="text-gray-400 line-clamp-2">{checkIn.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredCheckIns.length === 0 && (
          <div className="text-center py-12">
            <ChatBubbleLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-white">No check-ins found</h3>
            <p className="mt-1 text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
} 