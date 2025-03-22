'use client';

import { DataTable } from '@/components/admin/DataTable';
import { useState } from 'react';
import { ChartBarIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';

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
      </div>
    </div>
  );
} 