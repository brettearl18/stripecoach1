'use client';

import { DataTable } from '@/components/admin/DataTable';
import { useState } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  UserGroupIcon,
  ExclamationTriangleIcon,
  TrophyIcon,
  ArrowTrendingUpIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [topCoaches] = useState([
    {
      name: 'Michael Chen',
      email: 'michael.c@stripecoach.com',
      clients: '0/0',
      completionRate: 99,
      responseTime: '12h',
      progress: { success: 2, warning: 1, error: 1 }
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah.j@stripecoach.com',
      clients: '0/0',
      completionRate: 99,
      responseTime: '10h',
      progress: { success: 2, warning: 0, error: 1 }
    },
    {
      name: 'Coach Silvi',
      email: 'silvi@vanahealth.com.au',
      clients: '0/0',
      completionRate: 98,
      responseTime: '15h',
      progress: { success: 3, warning: 2, error: 1 }
    }
  ]);

  const [clientAlerts] = useState([
    {
      clientName: 'Emma Wilson',
      coachName: 'Michael Chen',
      type: 'missed_checkin',
      message: 'Missed last 3 check-ins',
      severity: 'high',
      date: '2h ago'
    },
    {
      clientName: 'James Brown',
      coachName: 'Sarah Johnson',
      type: 'plateau',
      message: 'Progress plateau for 2 weeks',
      severity: 'medium',
      date: '1d ago'
    },
    {
      clientName: 'Lisa Chen',
      coachName: 'Coach Silvi',
      type: 'subscription',
      message: 'Subscription ending in 3 days',
      severity: 'low',
      date: '2d ago'
    }
  ]);

  const [clientWins] = useState([
    {
      clientName: 'Tom Harris',
      coachName: 'Michael Chen',
      achievement: 'Reached weight goal',
      date: '1d ago'
    },
    {
      clientName: 'Sarah Zhang',
      coachName: 'Coach Silvi',
      achievement: 'Completed 30-day challenge',
      date: '2d ago'
    },
    {
      clientName: 'Mike Johnson',
      coachName: 'Sarah Johnson',
      achievement: 'New personal best',
      date: '3d ago'
    }
  ]);

  const [progressData] = useState([
    { month: 'Jan', activeClients: 120, completionRate: 85 },
    { month: 'Feb', activeClients: 135, completionRate: 88 },
    { month: 'Mar', activeClients: 156, completionRate: 92 }
  ]);

  const columns = [
    { header: 'Rank', key: 'rank', render: (_, __, index) => `#${index + 1}` },
    {
      header: 'Coach',
      key: 'name',
      render: (name, item) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
            <UserGroupIcon className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium text-white">{name}</div>
            <div className="text-sm text-gray-400">{item.email}</div>
          </div>
        </div>
      )
    },
    { header: 'Clients', key: 'clients' },
    {
      header: 'Completion Rate',
      key: 'completionRate',
      render: (rate) => (
        <div className="flex items-center">
          <div className="w-24 bg-gray-700 rounded-full h-2 mr-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${rate}%` }}
            />
          </div>
          <span>{rate}%</span>
        </div>
      )
    },
    {
      header: 'Response Time',
      key: 'responseTime',
      render: (time) => (
        <div className="flex items-center">
          <ClockIcon className="h-4 w-4 mr-1 text-blue-400" />
          {time}
        </div>
      )
    },
    {
      header: 'Client Progress',
      key: 'progress',
      render: (progress) => (
        <div className="flex items-center space-x-2">
          <span className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-1" />
            {progress.success}
          </span>
          <span className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-yellow-500 mr-1" />
            {progress.warning}
          </span>
          <span className="flex items-center">
            <span className="h-2 w-2 rounded-full bg-red-500 mr-1" />
            {progress.error}
          </span>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#13141A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Platform overview and key metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <h3 className="text-2xl font-bold text-white mt-1">$24,500</h3>
                <p className="text-green-500 text-sm mt-1">+12.5% from last month</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Coaches</p>
                <h3 className="text-2xl font-bold text-white mt-1">12</h3>
                <p className="text-green-500 text-sm mt-1">+2 this week</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Clients</p>
                <h3 className="text-2xl font-bold text-white mt-1">156</h3>
                <p className="text-green-500 text-sm mt-1">+8 this week</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1b1e] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Coach Leaderboard</h2>
          <DataTable
            columns={columns}
            data={topCoaches}
            actions={(coach) => (
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                View Dashboard →
              </button>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Client Progress Chart */}
          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-blue-500" />
              Client Progress Overview
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2b2e" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1b1e', 
                      border: '1px solid #2a2b2e',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="activeClients" 
                    stroke="#3b82f6" 
                    name="Active Clients"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completionRate" 
                    stroke="#10b981" 
                    name="Completion Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Alerts and Notifications */}
          <div className="bg-[#1a1b1e] rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <BellAlertIcon className="h-5 w-5 mr-2 text-yellow-500" />
              Recent Alerts
            </h2>
            <div className="space-y-4">
              {clientAlerts.map((alert, index) => (
                <div key={index} className="flex items-start p-3 rounded-lg bg-[#13141A]">
                  <div className={`
                    h-8 w-8 rounded-full flex items-center justify-center mr-3
                    ${alert.severity === 'high' ? 'bg-red-500/10 text-red-500' : 
                      alert.severity === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 
                      'bg-blue-500/10 text-blue-500'}
                  `}>
                    <ExclamationTriangleIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-white">{alert.clientName}</h3>
                      <span className="text-sm text-gray-400">{alert.date}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
                    <p className="text-sm text-gray-500 mt-1">Coach: {alert.coachName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Client Achievements */}
        <div className="bg-[#1a1b1e] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
            <TrophyIcon className="h-5 w-5 mr-2 text-yellow-500" />
            Recent Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clientWins.map((win, index) => (
              <div key={index} className="p-4 rounded-lg bg-[#13141A] border border-[#2a2b2e]">
                <div className="flex items-center mb-3">
                  <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center mr-3">
                    <TrophyIcon className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{win.clientName}</h3>
                    <p className="text-sm text-gray-400">Coach: {win.coachName}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{win.achievement}</p>
                <p className="text-xs text-gray-500 mt-2">{win.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 