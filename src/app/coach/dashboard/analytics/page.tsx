'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserPlusIcon,
  UserMinusIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  ArcElement
} from 'chart.js';
import { Line, Radar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Tab } from '@headlessui/react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  ArcElement
);

type TimeFrame = '1d' | '3d' | '7d' | '30d' | 'custom';
type ViewMode = 'overview' | 'clients';

interface ClientStats {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  progress: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    lastCheckIn: Date;
  };
  metrics: {
    completionRate: number;
    consistency: number;
    engagement: number;
  };
  goals: string[];
  subscription: {
    plan: string;
    status: string;
    nextBilling: Date;
  };
}

interface CoachAnalytics {
  activeClients: number;
  totalRevenue: number;
  averageCompletionRate: number;
  averageResponseTime: number;
  clientProgress: {
    improving: number;
    steady: number;
    declining: number;
  };
  monthlyRevenue: {
    month: string;
    amount: number;
  }[];
  clientRetention: {
    month: string;
    rate: number;
  }[];
  clientChanges: {
    newClients: number;
    lostClients: number;
    timeFrame: TimeFrame;
  };
  clientStats: ClientStats[];
}

export default function CoachAnalytics() {
  const [analytics, setAnalytics] = useState<CoachAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('7d');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeFrame]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const mockData: CoachAnalytics = {
        activeClients: 15,
        totalRevenue: 24999.99,
        averageCompletionRate: 92,
        averageResponseTime: 24, // hours
        clientProgress: {
          improving: 8,
          steady: 5,
          declining: 2,
        },
        monthlyRevenue: [
          { month: 'Jan', amount: 5000 },
          { month: 'Feb', amount: 5500 },
          { month: 'Mar', amount: 6000 },
          { month: 'Apr', amount: 6500 },
          { month: 'May', amount: 7000 },
          { month: 'Jun', amount: 7500 },
        ],
        clientRetention: [
          { month: 'Jan', rate: 95 },
          { month: 'Feb', rate: 92 },
          { month: 'Mar', rate: 90 },
          { month: 'Apr', rate: 88 },
          { month: 'May', rate: 85 },
          { month: 'Jun', rate: 82 },
        ],
        clientChanges: {
          newClients: Math.floor(Math.random() * 5),
          lostClients: Math.floor(Math.random() * 3),
          timeFrame: selectedTimeFrame,
        },
        clientStats: [
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            status: 'active',
            progress: {
              score: 85,
              trend: 'up',
              lastCheckIn: new Date(),
            },
            metrics: {
              completionRate: 92,
              consistency: 88,
              engagement: 95,
            },
            goals: ['Weight Loss', 'Muscle Gain'],
            subscription: {
              plan: 'Premium',
              status: 'active',
              nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
          // Add more mock client data as needed
        ],
      };
      setAnalytics(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeFrameLabel = (timeFrame: TimeFrame) => {
    switch (timeFrame) {
      case '1d': return 'Last 24 hours';
      case '3d': return 'Last 3 days';
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case 'custom': return 'Custom range';
      default: return 'Last 7 days';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F15] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading analytics...
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-[#0B0F15] flex items-center justify-center text-white">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F15] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-400">Track your coaching business performance</p>
        </div>

        {/* Time Frame Selector */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Time Frame:</span>
              <select
                value={selectedTimeFrame}
                onChange={(e) => setSelectedTimeFrame(e.target.value as TimeFrame)}
                className="bg-[#1A1F2B] text-white rounded-lg px-3 py-1.5 text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="3d">Last 3 days</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            <div className="text-sm text-gray-400">
              {getTimeFrameLabel(selectedTimeFrame)}
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <Tab.Group selectedIndex={viewMode === 'overview' ? 0 : 1} onChange={(index) => setViewMode(index === 0 ? 'overview' : 'clients')}>
          <Tab.List className="flex space-x-1 rounded-xl bg-[#1A1F2B] p-1 mb-8">
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                ${selected
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              Overview
            </Tab>
            <Tab
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                ${selected
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-gray-400 hover:bg-white/[0.12] hover:text-white'
                }`
              }
            >
              Client Details
            </Tab>
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#1A1F2B] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <UserGroupIcon className="h-5 w-5 text-blue-400" />
                    <div className="text-sm text-gray-400">Active Clients</div>
                  </div>
                  <div className="text-2xl font-semibold">{analytics.activeClients}</div>
                </div>

                <div className="bg-[#1A1F2B] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <CurrencyDollarIcon className="h-5 w-5 text-green-400" />
                    <div className="text-sm text-gray-400">Total Revenue</div>
                  </div>
                  <div className="text-2xl font-semibold">${analytics.totalRevenue.toLocaleString()}</div>
                </div>

                <div className="bg-[#1A1F2B] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <ChartBarIcon className="h-5 w-5 text-yellow-400" />
                    <div className="text-sm text-gray-400">Completion Rate</div>
                  </div>
                  <div className="text-2xl font-semibold">{analytics.averageCompletionRate}%</div>
                </div>

                <div className="bg-[#1A1F2B] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <ClockIcon className="h-5 w-5 text-purple-400" />
                    <div className="text-sm text-gray-400">Avg Response Time</div>
                  </div>
                  <div className="text-2xl font-semibold">{analytics.averageResponseTime}h</div>
                </div>

                <div className="bg-[#1A1F2B] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <UserPlusIcon className="h-5 w-5 text-emerald-400" />
                    <div className="text-sm text-gray-400">New Clients</div>
                  </div>
                  <div className="text-2xl font-semibold text-emerald-400">+{analytics.clientChanges.newClients}</div>
                  <div className="text-sm text-gray-400 mt-1">{getTimeFrameLabel(analytics.clientChanges.timeFrame)}</div>
                </div>

                <div className="bg-[#1A1F2B] rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <UserMinusIcon className="h-5 w-5 text-red-400" />
                    <div className="text-sm text-gray-400">Lost Clients</div>
                  </div>
                  <div className="text-2xl font-semibold text-red-400">-{analytics.clientChanges.lostClients}</div>
                  <div className="text-sm text-gray-400 mt-1">{getTimeFrameLabel(analytics.clientChanges.timeFrame)}</div>
                </div>
              </div>

              {/* Client Progress and Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Client Progress */}
                <div className="bg-[#1A1F2B] rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Client Progress</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-[#2A303C] rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
                          <div className="text-sm text-gray-400">Improving</div>
                        </div>
                        <div className="text-xl font-semibold">{analytics.clientProgress.improving}</div>
                      </div>
                    </div>

                    <div className="bg-[#2A303C] rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ChartBarIcon className="h-5 w-5 text-yellow-400" />
                          <div className="text-sm text-gray-400">Steady</div>
                        </div>
                        <div className="text-xl font-semibold">{analytics.clientProgress.steady}</div>
                      </div>
                    </div>

                    <div className="bg-[#2A303C] rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ArrowTrendingDownIcon className="h-5 w-5 text-red-400" />
                          <div className="text-sm text-gray-400">Declining</div>
                        </div>
                        <div className="text-xl font-semibold">{analytics.clientProgress.declining}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-[#1A1F2B] rounded-lg p-6 lg:col-span-2">
                  <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
                  <div className="h-[300px]">
                    <Line
                      data={{
                        labels: analytics.monthlyRevenue.map(d => d.month),
                        datasets: [{
                          label: 'Revenue',
                          data: analytics.monthlyRevenue.map(d => d.amount),
                          borderColor: '#22c55e',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          fill: true,
                          tension: 0.4,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: 'rgba(255, 255, 255, 0.5)' },
                          },
                          x: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: 'rgba(255, 255, 255, 0.5)' },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Retention Chart */}
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-[#1A1F2B] rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Client Retention Rate</h2>
                  <div className="h-[300px]">
                    <Line
                      data={{
                        labels: analytics.clientRetention.map(d => d.month),
                        datasets: [{
                          label: 'Retention Rate',
                          data: analytics.clientRetention.map(d => d.rate),
                          borderColor: '#3b82f6',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          fill: true,
                          tension: 0.4,
                        }],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            max: 100,
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: 'rgba(255, 255, 255, 0.5)' },
                          },
                          x: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: 'rgba(255, 255, 255, 0.5)' },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>
            </Tab.Panel>
            <Tab.Panel>
              {/* Client Table */}
              <div className="bg-[#1A1F2B] rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Client Performance</h2>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      placeholder="Search clients..."
                      className="bg-[#2A303C] text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      className="bg-[#2A303C] text-white rounded-lg px-4 py-2 text-sm border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-400 border-b border-gray-700">
                        <th className="pb-4">Client</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4">Progress</th>
                        <th className="pb-4">Completion Rate</th>
                        <th className="pb-4">Consistency</th>
                        <th className="pb-4">Engagement</th>
                        <th className="pb-4">Last Check-in</th>
                        <th className="pb-4">Subscription</th>
                        <th className="pb-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.clientStats.map((client) => (
                        <tr key={client.id} className="border-b border-gray-700">
                          <td className="py-4">
                            <div>
                              <div className="font-medium">{client.name}</div>
                              <div className="text-sm text-gray-400">{client.email}</div>
                            </div>
                          </td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              client.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {client.status}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{client.progress.score}%</span>
                              {client.progress.trend === 'up' && (
                                <ArrowTrendingUpIcon className="h-4 w-4 text-green-400" />
                              )}
                              {client.progress.trend === 'down' && (
                                <ArrowTrendingDownIcon className="h-4 w-4 text-red-400" />
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${client.metrics.completionRate}%` }}
                              />
                            </div>
                            <span className="text-sm ml-2">{client.metrics.completionRate}%</span>
                          </td>
                          <td className="py-4">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-yellow-500 h-2 rounded-full"
                                style={{ width: `${client.metrics.consistency}%` }}
                              />
                            </div>
                            <span className="text-sm ml-2">{client.metrics.consistency}%</span>
                          </td>
                          <td className="py-4">
                            <div className="w-24 bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${client.metrics.engagement}%` }}
                              />
                            </div>
                            <span className="text-sm ml-2">{client.metrics.engagement}%</span>
                          </td>
                          <td className="py-4">
                            <div className="text-sm">
                              {new Date(client.progress.lastCheckIn).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-4">
                            <div>
                              <div className="text-sm font-medium">{client.subscription.plan}</div>
                              <div className="text-xs text-gray-400">
                                Next billing: {new Date(client.subscription.nextBilling).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="py-4">
                            <button className="text-blue-400 hover:text-blue-300 text-sm">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
} 