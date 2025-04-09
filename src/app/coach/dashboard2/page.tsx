'use client';

import { useState } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';

interface ClientMetrics {
  id: string;
  name: string;
  status: 'on_track' | 'at_risk' | 'needs_attention';
  progress: number;
  lastCheckIn: string;
  nextCheckIn: string;
  streak: number;
  workouts: {
    completed: number;
    total: number;
  };
  nutrition: number;
  steps: number;
  sleep: number;
  mood: 'great' | 'good' | 'okay' | 'poor';
  priority: 'high' | 'medium' | 'low';
}

// Mock data
const mockClients: ClientMetrics[] = Array.from({ length: 20 }, (_, i) => ({
  id: `client-${i + 1}`,
  name: `Client ${i + 1}`,
  status: ['on_track', 'at_risk', 'needs_attention'][Math.floor(Math.random() * 3)] as ClientMetrics['status'],
  progress: Math.floor(Math.random() * 100),
  lastCheckIn: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  nextCheckIn: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  streak: Math.floor(Math.random() * 30),
  workouts: {
    completed: Math.floor(Math.random() * 7),
    total: 7,
  },
  nutrition: Math.floor(Math.random() * 100),
  steps: Math.floor(Math.random() * 15000),
  sleep: Math.floor(Math.random() * 10),
  mood: ['great', 'good', 'okay', 'poor'][Math.floor(Math.random() * 4)] as ClientMetrics['mood'],
  priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as ClientMetrics['priority'],
}));

export default function Dashboard2() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ClientMetrics['status'] | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ClientMetrics | '';
    direction: 'asc' | 'desc';
  }>({ key: '', direction: 'asc' });

  const getStatusIcon = (status: ClientMetrics['status']) => {
    switch (status) {
      case 'on_track':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'at_risk':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
      case 'needs_attention':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getMoodColor = (mood: ClientMetrics['mood']) => {
    switch (mood) {
      case 'great':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'okay':
        return 'text-yellow-500';
      case 'poor':
        return 'text-red-500';
    }
  };

  const getPriorityColor = (priority: ClientMetrics['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
  };

  const handleSort = (key: keyof ClientMetrics) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const getSortedClients = () => {
    let filtered = [...mockClients];

    if (searchTerm) {
      filtered = filtered.filter((client) =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((client) => client.status === filterStatus);
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

  const getSortIcon = (key: keyof ClientMetrics) => {
    if (sortConfig.key !== key) {
      return <ChevronUpIcon className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4 text-white" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 text-white" />
    );
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
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Clients</p>
                <p className="text-2xl font-semibold text-white">{mockClients.length}</p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">On Track</p>
                <p className="text-2xl font-semibold text-white">
                  {mockClients.filter(c => c.status === 'on_track').length}
                </p>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Needs Attention</p>
                <p className="text-2xl font-semibold text-white">
                  {mockClients.filter(c => c.status === 'needs_attention').length}
                </p>
              </div>
              <ClockIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">At Risk</p>
                <p className="text-2xl font-semibold text-white">
                  {mockClients.filter(c => c.status === 'at_risk').length}
                </p>
              </div>
              <ExclamationCircleIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
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
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ClientMetrics['status'] | 'all')}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="on_track">On Track</option>
                <option value="needs_attention">Needs Attention</option>
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
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('progress')}>
                      Progress {getSortIcon('progress')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('lastCheckIn')}>
                      Last Check-in {getSortIcon('lastCheckIn')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('nextCheckIn')}>
                      Next Check-in {getSortIcon('nextCheckIn')}
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
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('steps')}>
                      Steps {getSortIcon('steps')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('sleep')}>
                      Sleep {getSortIcon('sleep')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('mood')}>
                      Mood {getSortIcon('mood')}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSort('priority')}>
                      Priority {getSortIcon('priority')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {getSortedClients().map((client) => (
                  <tr key={client.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusIcon(client.status)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-white font-medium">{client.name}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 w-24 bg-gray-700 rounded-full">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${client.progress}%` }}
                          />
                        </div>
                        <span className="text-white text-sm">{client.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                      {client.lastCheckIn}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                      {client.nextCheckIn}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-white">{client.streak} days</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-white">{client.workouts.completed}/{client.workouts.total}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-white">{client.nutrition}%</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-white">{client.steps.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-white">{client.sleep}h</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`font-medium ${getMoodColor(client.mood)}`}>
                        {client.mood.charAt(0).toUpperCase() + client.mood.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(client.priority)}`}>
                        {client.priority.toUpperCase()}
                      </span>
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