'use client';

import { useState } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  BellIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

interface ClientData {
  id: string;
  name: string;
  status: 'completed' | 'pending' | 'overdue' | 'at_risk';
  progress: number;
  streak: number;
  weeklyHistory: ('good' | 'moderate' | 'poor' | 'missed')[];
  workouts: {
    completed: number;
    total: number;
  };
  nutrition: number;
  nextCheckIn: string;
  priority: 'ASAP' | 'High' | 'Medium' | 'Low';
  hasCheckedIn: boolean;
}

// Mock data with 20 clients
const mockClients: ClientData[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    status: 'completed',
    progress: 85,
    streak: 12,
    weeklyHistory: ['good', 'good', 'good', 'good', 'good'],
    workouts: { completed: 5, total: 7 },
    nutrition: 90,
    nextCheckIn: '2024-03-28',
    priority: 'ASAP',
    hasCheckedIn: true,
  },
  {
    id: '2',
    name: 'Michael Chen',
    status: 'pending',
    progress: 75,
    streak: 8,
    weeklyHistory: ['good', 'moderate', 'good', 'poor', 'moderate'],
    workouts: { completed: 4, total: 7 },
    nutrition: 85,
    nextCheckIn: '2024-03-27',
    priority: 'High',
    hasCheckedIn: false,
  },
  {
    id: '3',
    name: 'Emma Wilson',
    status: 'at_risk',
    progress: 45,
    streak: 0,
    weeklyHistory: ['missed', 'poor', 'moderate', 'poor', 'missed'],
    workouts: { completed: 2, total: 7 },
    nutrition: 60,
    nextCheckIn: '2024-03-22',
    priority: 'High',
    hasCheckedIn: false,
  },
  // Add more mock clients here...
].concat(
  Array.from({ length: 17 }, (_, i) => ({
    id: `${i + 4}`,
    name: `Client ${i + 4}`,
    status: ['completed', 'pending', 'at_risk', 'overdue'][Math.floor(Math.random() * 4)] as ClientData['status'],
    progress: Math.floor(Math.random() * 100),
    streak: Math.floor(Math.random() * 14),
    weeklyHistory: Array.from({ length: 5 }, () => 
      ['good', 'moderate', 'poor', 'missed'][Math.floor(Math.random() * 4)] as 'good' | 'moderate' | 'poor' | 'missed'
    ),
    workouts: {
      completed: Math.floor(Math.random() * 7),
      total: 7,
    },
    nutrition: Math.floor(Math.random() * 100),
    nextCheckIn: new Date(Date.now() + Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: ['ASAP', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)] as ClientData['priority'],
    hasCheckedIn: Math.random() > 0.5,
  }))
);

export default function ClientOverview() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ClientData | '';
    direction: 'asc' | 'desc';
  }>({ key: '', direction: 'asc' });

  const getStatusIcon = (status: ClientData['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'overdue':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
      case 'at_risk':
        return <FlagIcon className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: ClientData['priority']) => {
    switch (priority) {
      case 'ASAP':
        return 'text-red-500 bg-red-500/10';
      case 'High':
        return 'text-orange-500 bg-orange-500/10';
      case 'Medium':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'Low':
        return 'text-green-500 bg-green-500/10';
    }
  };

  const handleSort = (key: keyof ClientData) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const getSortedClients = () => {
    let filtered = [...mockClients];
    
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(client => client.status === filterStatus);
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  };

  const getSortIcon = (key: keyof ClientData) => {
    if (sortConfig.key !== key) {
      return <ChevronUpIcon className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4 text-white" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 text-white" />
    );
  };

  const getHistorySquareColor = (status: 'good' | 'moderate' | 'poor' | 'missed') => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'moderate':
        return 'bg-orange-500';
      case 'poor':
        return 'bg-red-500';
      case 'missed':
        return 'bg-transparent border-2 border-gray-500';
    }
  };

  const handleSendReminder = (clientId: string, clientName: string) => {
    // This would integrate with your chat system to send a notification
    console.log(`Sending reminder to ${clientName}`);
    // Add your chat notification logic here
  };

  const handleReviewCheckIn = (clientId: string, clientName: string) => {
    // This would open the check-in review modal/page
    console.log(`Reviewing check-in for ${clientName}`);
    // Add your review navigation logic here
  };

  return (
    <div className="min-h-screen bg-[#141517]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Client Overview</h1>
            <p className="text-sm text-gray-400">Track and manage your clients' progress</p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            + Add New Client
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="at_risk">At Risk</option>
              </select>
              <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Client Table */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('status')}>
                      Status {getSortIcon('status')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('name')}>
                      Name {getSortIcon('name')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('priority')}>
                      Priority {getSortIcon('priority')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('progress')}>
                      Progress {getSortIcon('progress')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('streak')}>
                      Streak {getSortIcon('streak')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Workouts
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('nutrition')}>
                      Nutrition {getSortIcon('nutrition')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('nextCheckIn')}>
                      Next Check-in {getSortIcon('nextCheckIn')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      Weekly History
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Check-in Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {getSortedClients().map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusIcon(client.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-white font-medium">{client.name}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(client.priority)}`}>
                        {client.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 w-24 bg-gray-700 rounded-full">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${client.progress}%` }}
                          />
                        </div>
                        <span className="text-white text-sm">{client.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-1">
                        {client.weeklyHistory.map((status, index) => (
                          <div
                            key={index}
                            className={`w-4 h-4 rounded ${getHistorySquareColor(status)} opacity-90`}
                            title={`Week ${5 - index}: ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-white">{client.workouts.completed}/{client.workouts.total}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-white">{client.nutrition}%</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-white">{client.nextCheckIn}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button className="text-indigo-400 hover:text-indigo-300">
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {client.hasCheckedIn ? (
                        <button
                          onClick={() => handleReviewCheckIn(client.id, client.name)}
                          className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors group relative"
                          title="Review check-in"
                        >
                          <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg">
                            <CheckIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">Review check-in</span>
                          </div>
                          <span className="absolute -top-2 left-0 w-max opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-xs text-gray-300 px-2 py-1 rounded pointer-events-none">
                            Click to review check-in details
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendReminder(client.id, client.name)}
                          className="flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors group relative"
                          title="Send check-in reminder"
                        >
                          <div className="flex items-center gap-2 bg-yellow-500/10 px-3 py-1.5 rounded-lg">
                            <BellIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">Send reminder</span>
                          </div>
                          <span className="absolute -top-2 left-0 w-max opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-xs text-gray-300 px-2 py-1 rounded pointer-events-none">
                            Click to send a check-in reminder
                          </span>
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button className="text-indigo-400 hover:text-indigo-300">
                        <ChevronRightIcon className="h-5 w-5" />
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