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
import DashboardMetricsGrid from './components/dashboard/DashboardMetricsGrid';
import CoachPerformanceTable from './components/dashboard/CoachPerformanceTable';
import ClientAlertsPanel from './components/dashboard/ClientAlertsPanel';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          A high-level overview of your coaching platform's performance and key metrics.
        </p>
      </div>

      {/* Metrics Grid */}
      <DashboardMetricsGrid />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Coach Performance Table */}
        <div className="lg:col-span-2">
          <CoachPerformanceTable />
        </div>

        {/* Client Alerts Panel */}
        <div className="lg:col-span-2">
          <ClientAlertsPanel />
        </div>
      </div>
    </div>
  );
} 