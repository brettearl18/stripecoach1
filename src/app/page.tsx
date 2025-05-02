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
  UserCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

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
  const [loading, setLoading] = useState(false);

  // Handler for the test AI button
  const handleTestAI = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/test-ai-recipe', { method: 'POST' });
      const data = await res.json();
      if (data.recipe) {
        alert(data.recipe);
      } else if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert('No recipe returned.');
      }
    } catch (err) {
      alert('Failed to fetch recipe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <AuthNav />
      
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-4">Welcome to Checkin.io</h1>
        <p className="text-xl text-center text-gray-300 mb-6">Select a section to get started</p>
        
        {/* Add Client Sign Up Button */}
        <div className="flex flex-col items-center mb-12 gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
          >
            <UserCircleIcon className="h-6 w-6 mr-2" />
            Client Sign Up
          </Link>
          <button
            onClick={handleTestAI}
            disabled={loading}
            className="mt-2 px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-pink-500 to-yellow-500 rounded-lg shadow-lg hover:from-pink-600 hover:to-yellow-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Generating Recipe...' : 'Test AI Recipe'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Stripe Coach Admin Portal */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <div className="flex items-center mb-4">
              <BuildingOfficeIcon className="h-8 w-8 text-indigo-500 mr-3" />
              <h2 className="text-2xl font-semibold">Stripe Coach Admin</h2>
            </div>
            <p className="text-gray-400 mb-6">Platform-wide administration and management</p>
            <Link
              href="/admin/subscriptions"
              className={`block w-full py-2 px-4 text-center rounded ${
                user?.role === 'admin'
                  ? 'bg-indigo-500 hover:bg-indigo-600'
                  : 'bg-gray-700 cursor-not-allowed'
              }`}
            >
              {user?.role === 'admin' ? 'Access Admin Portal' : 'Admin Access Only'}
            </Link>
          </div>

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
