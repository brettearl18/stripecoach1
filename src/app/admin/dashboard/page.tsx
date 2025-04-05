'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  UserGroupIcon,
  DocumentCheckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import AIInsights from '../components/AIInsights';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats] = useState({
    totalClients: 24,
    monthlyRevenue: 4200,
    pendingCheckins: 8,
    clientRetention: 95,
    clientGrowth: '+15%',
    revenueGrowth: '+8%',
    checkinChange: '-2',
    retentionGrowth: '+3%'
  });

  const quickActions = [
    {
      name: 'Outstanding Payments',
      href: '/admin/outstanding-payments',
      icon: CurrencyDollarIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: '3 payments pending'
    },
    {
      name: 'Review Check-ins',
      href: '/admin/check-ins',
      icon: DocumentCheckIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: '8 to review'
    },
    {
      name: 'Manage Forms',
      href: '/admin/forms',
      icon: ChartBarIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Update templates'
    },
    {
      name: 'Schedule Sessions',
      href: '/admin/schedule',
      icon: ChartBarIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'View calendar'
    },
  ];

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
              Admin Dashboard
            </h2>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Clients</p>
                <div className="flex items-baseline">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalClients}</h3>
                  <span className="ml-2 text-sm text-green-500">{stats.clientGrowth}</span>
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue</p>
                <div className="flex items-baseline">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${stats.monthlyRevenue}</h3>
                  <span className="ml-2 text-sm text-green-500">{stats.revenueGrowth}</span>
                </div>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending Check-ins</p>
                <div className="flex items-baseline">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pendingCheckins}</h3>
                  <span className="ml-2 text-sm text-red-500">{stats.checkinChange}</span>
                </div>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <DocumentCheckIcon className="h-6 w-6 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Client Retention</p>
                <div className="flex items-baseline">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.clientRetention}%</h3>
                  <span className="ml-2 text-sm text-green-500">{stats.retentionGrowth}</span>
                </div>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className={`relative rounded-xl ${action.bgColor} px-6 py-5 flex flex-col hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-center mb-2">
                  <action.icon className={`h-6 w-6 ${action.color}`} aria-hidden="true" />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{action.name}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* AI Insights Section */}
        <AIInsights />

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          New check-in received from <span className="font-medium text-gray-900 dark:text-white">Sarah Wilson</span>
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                        <time dateTime="2024-03-17">1h ago</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 