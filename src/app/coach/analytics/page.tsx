'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  CalendarIcon,
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import { DashboardNav } from '@/components/DashboardNav';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data - replace with real data from your backend
const mockData = {
  clientMetrics: {
    totalClients: 45,
    activeClients: 38,
    retentionRate: 92,
    avgSessionsPerWeek: 3.5,
    revenuePerClient: 250,
  },
  monthlyRevenue: [
    { month: 'Jan', revenue: 8500 },
    { month: 'Feb', revenue: 9200 },
    { month: 'Mar', revenue: 11000 },
    { month: 'Apr', revenue: 10500 },
    { month: 'May', revenue: 12000 },
  ],
  clientProgress: {
    weightLoss: { achieved: 85, total: 100 },
    strengthGains: { achieved: 72, total: 100 },
    nutritionAdherence: { achieved: 68, total: 100 },
    workoutCompletion: { achieved: 88, total: 100 },
  },
  topPerformers: [
    { name: 'Sarah Wilson', metric: 'Most Consistent', progress: 95 },
    { name: 'James Thompson', metric: 'Best Progress', progress: 88 },
    { name: 'Emma Davis', metric: 'Most Improved', progress: 82 },
  ],
};

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('month');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardNav />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Comprehensive insights into your coaching business and client progress
            </p>
          </div>

          {/* Time Frame Selector */}
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={() => setTimeframe('week')}
              className={
                timeframe === 'week'
                  ? 'px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={
                timeframe === 'month'
                  ? 'px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('quarter')}
              className={
                timeframe === 'quarter'
                  ? 'px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                  : 'px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            >
              Quarter
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Clients</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {mockData.clientMetrics.totalClients}
                  </h3>
                </div>
                <UsersIcon className="w-12 h-12 text-indigo-500 opacity-80" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+12%</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">vs last month</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    ${mockData.monthlyRevenue[mockData.monthlyRevenue.length - 1].revenue.toLocaleString()}
                  </h3>
                </div>
                <CurrencyDollarIcon className="w-12 h-12 text-green-500 opacity-80" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+8%</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">vs last month</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Retention Rate</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {mockData.clientMetrics.retentionRate}%
                  </h3>
                </div>
                <ChartPieIcon className="w-12 h-12 text-purple-500 opacity-80" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+5%</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">vs last quarter</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Sessions/Week</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {mockData.clientMetrics.avgSessionsPerWeek}
                  </h3>
                </div>
                <ClockIcon className="w-12 h-12 text-blue-500 opacity-80" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-500">+0.5</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">vs last month</span>
              </div>
            </motion.div>
          </div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-8"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Client Progress and AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Client Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Client Progress Overview</h3>
              <div className="space-y-4">
                {Object.entries(mockData.clientProgress).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {value.achieved}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500"
                        style={{ width: `${value.achieved}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-6">
                <SparklesIcon className="w-6 h-6 text-indigo-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Business Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <h4 className="font-medium text-indigo-700 dark:text-indigo-300 mb-2">Revenue Optimization</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Based on current trends, increasing session frequency by 1 per week could boost revenue by 15%.
                    Consider introducing a premium tier package.
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">Client Retention</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Clients who attend 3+ sessions per week show 95% retention rate. Focus on encouraging more
                    frequent check-ins with less active clients.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                  <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Growth Opportunity</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your client satisfaction scores indicate room for 30% business growth. Consider expanding your
                    team or introducing group sessions.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Performing Clients</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockData.topPerformers.map((performer, index) => (
                <div
                  key={index}
                  className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-start gap-4"
                >
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                    <UsersIcon className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{performer.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{performer.metric}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${performer.progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {performer.progress}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
} 