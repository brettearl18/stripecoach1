'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  CalendarIcon,
  BellIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { createTestData } from '@/lib/services/firebaseService';

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
}

export default function AdminDashboard2() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreatingTestData, setIsCreatingTestData] = useState(false);

  const handleCreateTestData = async () => {
    try {
      setIsCreatingTestData(true);
      await createTestData();
      alert('Test data created successfully!');
    } catch (error) {
      console.error('Error creating test data:', error);
      alert('Error creating test data. Please try again.');
    } finally {
      setIsCreatingTestData(false);
    }
  };

  const stats: StatCard[] = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: '+20.1%',
      trend: 'up',
      icon: CreditCardIcon
    },
    {
      title: 'Active Coaches',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: UserGroupIcon
    },
    {
      title: 'Total Clients',
      value: '156',
      change: '+12.3%',
      trend: 'up',
      icon: UserIcon
    },
    {
      title: 'Pending Check-ins',
      value: '23',
      change: '-5',
      trend: 'down',
      icon: ClipboardDocumentListIcon
    }
  ];

  const navigation: NavigationItem[] = [
    {
      name: 'Coach Management',
      href: '/admin/coaches',
      icon: UserGroupIcon,
      description: 'Manage coaches, their assignments, and performance'
    },
    {
      name: 'Client Management',
      href: '/admin/clients',
      icon: UserIcon,
      description: 'View and manage all clients across the platform'
    },
    {
      name: 'Forms & Check-ins',
      href: '/admin/forms',
      icon: ClipboardDocumentListIcon,
      description: 'Configure and monitor check-in forms and responses'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: ChartBarIcon,
      description: 'Platform-wide analytics and reporting'
    },
    {
      name: 'Payments',
      href: '/admin/payments',
      icon: CreditCardIcon,
      description: 'Track revenue, subscriptions, and payments'
    },
    {
      name: 'Calendar',
      href: '/admin/calendar',
      icon: CalendarIcon,
      description: 'Manage schedules and appointments'
    },
    {
      name: 'Notifications',
      href: '/admin/notifications',
      icon: BellIcon,
      description: 'Configure and send system notifications'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Cog6ToothIcon,
      description: 'Platform configuration and preferences'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B0F15] text-white">
      {/* Header */}
      <header className="bg-[#1A1F2B] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateTestData}
                disabled={isCreatingTestData}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
              >
                {isCreatingTestData ? 'Creating...' : 'Create Test Data'}
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                New Coach
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.title} className="bg-[#1A1F2B] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-400 ml-2">vs last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="bg-[#1A1F2B] rounded-lg p-6 hover:bg-[#2A303C] transition-colors"
            >
              <div className="flex items-center space-x-4">
                <item.icon className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 