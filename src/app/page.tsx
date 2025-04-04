'use client';

import { AuthNav } from '@/components/navigation/AuthNav';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  UserGroupIcon,
  UserIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CreditCardIcon,
  CalendarIcon,
  BellIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

// List of implemented pages
const implementedPages = [
  '/admin',
  '/admin/coaches',
  '/admin/clients',
  '/admin/analytics',
  '/admin/forms',
  '/admin/payments',
  '/admin/calendar',
  '/admin/settings',
  '/admin/avatars',
  '/coach/dashboard',
  '/coach/clients',
  '/coach/check-ins',
  '/coach/analytics',
  '/client/dashboard',
  '/client/coach',
  '/client/check-in',
  '/client/progress',
  '/client/messages',
  '/client/profile',
  '/client/settings',
  '/admin/sitemap'
];

// List of implemented footer links
const implementedFooterLinks = [
  '/admin/sitemap'
];

interface NavigationSection {
  title: string;
  description: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    description: string;
  }[];
}

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <AuthNav />
      
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-4">Welcome to Checkin.io</h1>
        <p className="text-xl text-center text-gray-300 mb-12">Select a section to get started</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Admin Portal */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <div className="flex items-center mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-blue-500 mr-3" />
              <h2 className="text-2xl font-semibold">Admin Dashboard</h2>
            </div>
            <p className="text-gray-400 mb-6">Business owner and administrator controls</p>
            <Link
              href="/admin"
              className={`block w-full py-2 px-4 text-center rounded ${
                user?.role === 'admin'
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-700 cursor-not-allowed'
              }`}
            >
              {user?.role === 'admin' ? 'Access Dashboard' : 'Admin Access Only'}
            </Link>
          </div>

          {/* Coach Portal */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <div className="flex items-center mb-4">
              <UserGroupIcon className="h-8 w-8 text-green-500 mr-3" />
              <h2 className="text-2xl font-semibold">Coach Portal</h2>
            </div>
            <p className="text-gray-400 mb-6">Coach-specific features and controls</p>
            <Link
              href="/coach/dashboard"
              className={`block w-full py-2 px-4 text-center rounded ${
                ['admin', 'coach'].includes(user?.role || '')
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-700 cursor-not-allowed'
              }`}
            >
              {['admin', 'coach'].includes(user?.role || '')
                ? 'Access Dashboard'
                : 'Coach Access Only'}
            </Link>
          </div>

          {/* Client Portal */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <div className="flex items-center mb-4">
              <UserIcon className="h-8 w-8 text-purple-500 mr-3" />
              <h2 className="text-2xl font-semibold">Client Portal</h2>
            </div>
            <p className="text-gray-400 mb-6">Client-facing features and interactions</p>
            <Link
              href="/client/dashboard"
              className={`block w-full py-2 px-4 text-center rounded ${
                ['admin', 'coach', 'client'].includes(user?.role || '')
                  ? 'bg-purple-500 hover:bg-purple-600'
                  : 'bg-gray-700 cursor-not-allowed'
              }`}
            >
              {['admin', 'coach', 'client'].includes(user?.role || '')
                ? 'Access Dashboard'
                : 'Please Log In'}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
