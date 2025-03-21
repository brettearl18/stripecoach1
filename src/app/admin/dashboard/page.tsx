'use client';

import {
  UsersIcon,
  CreditCardIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import AIInsights from '../components/AIInsights';

const stats = [
  { 
    name: 'Total Clients', 
    value: '24', 
    icon: UsersIcon,
    trend: '+15%',
    color: 'from-blue-50 to-blue-100',
    iconColor: 'text-blue-600'
  },
  { 
    name: 'Monthly Revenue', 
    value: '$4,200', 
    icon: CreditCardIcon,
    trend: '+8%',
    color: 'from-green-50 to-green-100',
    iconColor: 'text-green-600'
  },
  { 
    name: 'Pending Check-ins', 
    value: '8', 
    icon: ClipboardDocumentCheckIcon,
    trend: '-2',
    color: 'from-yellow-50 to-yellow-100',
    iconColor: 'text-yellow-600'
  },
  { 
    name: 'Client Retention', 
    value: '95%', 
    icon: ChartBarIcon,
    trend: '+3%',
    color: 'from-purple-50 to-purple-100',
    iconColor: 'text-purple-600'
  },
];

const quickActions = [
  {
    name: 'Outstanding Payments',
    href: '/admin/outstanding-payments',
    icon: CreditCardIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: '3 payments pending'
  },
  {
    name: 'Review Check-ins',
    href: '/admin/check-ins',
    icon: ClipboardDocumentCheckIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: '8 to review'
  },
  {
    name: 'Manage Forms',
    href: '/admin/forms',
    icon: ArrowTrendingUpIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Update templates'
  },
  {
    name: 'Schedule Sessions',
    href: '/admin/schedule',
    icon: CalendarIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'View calendar'
  },
];

export default function AdminDashboard() {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Coach Dashboard
            </h2>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="relative bg-gradient-to-br rounded-xl overflow-hidden group hover:shadow-md transition-all duration-200"
              style={{ backgroundColor: 'white' }}
            >
              <div className={`absolute inset-0 opacity-40 bg-gradient-to-br ${stat.color}`} />
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-shrink-0">
                    <stat.icon className={`h-8 w-8 ${stat.iconColor}`} aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-600 truncate">{stat.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          {stat.trend}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
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
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center ring-8 ring-white">
                        <ClipboardDocumentCheckIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          New check-in received from <span className="font-medium text-gray-900">Sarah Wilson</span>
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
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