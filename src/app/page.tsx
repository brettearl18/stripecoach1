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
import FirebaseConnectionTest from '@/components/FirebaseConnectionTest';
import FeedbackModal from '@/components/FeedbackModal';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

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
  const [feedbackOpen, setFeedbackOpen] = useState(false);

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

  const handleTestFeedback = async () => {
    try {
      const db = getFirestore();
      await addDoc(collection(db, 'feedback'), {
        message: 'This is a test feedback message.',
        email: 'test@example.com',
        createdAt: serverTimestamp(),
      });
      toast.success('Test feedback submitted!');
    } catch (error) {
      toast.error('Failed to submit test feedback.');
      console.error('Test feedback error:', error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <AuthNav />
      
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-4">Welcome to Checkin.io</h1>
        <p className="text-xl text-center text-gray-300 mb-6">Select a section to get started</p>
        
        {/* Add Coach/Admin Sign Up Button */}
        <Link
          href="/signup"
          className="inline-flex items-center px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 mb-2"
        >
          <UserGroupIcon className="h-6 w-6 mr-2" />
          Coach/Admin Sign Up
        </Link>
        {/* Add Client Sign Up Button */}
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
        {/* Create Check-In Template Button */}
        <button
          onClick={async () => {
            setLoading(true);
            try {
              const db = getFirestore();
              await addDoc(collection(db, 'checkIns'), {
                clientId: 'test-client-id',
                coachId: 'test-coach-id',
                answers: {
                  energy: 4,
                  mood: 'Feeling good!',
                  nutrition: 'Ate healthy meals all week.',
                  workouts: 5,
                },
                createdAt: serverTimestamp(),
              });
              console.log('Check-in created!');
              toast.success('Test check-in created! Check Firestore for aiInsights after a minute.');
            } catch (error: any) {
              toast.error('Error creating check-in: ' + error.message);
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="mt-2 px-8 py-3 text-lg font-medium text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-lg shadow-lg hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Check-In Template'}
        </button>
      </div>

      <div className="mb-8">
        <FirebaseConnectionTest />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Coach Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Client Management</li>
            <li>Program Creation</li>
            <li>Progress Tracking</li>
            <li>Check-in Management</li>
          </ul>
        </div>

        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Client Features</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            <li>Program Access</li>
            <li>Progress Updates</li>
            <li>Check-in Submissions</li>
            <li>Resource Library</li>
          </ul>
        </div>
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

        {/* Coach Dashboard V2 (AI) */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 rounded-lg p-6 shadow-lg border border-gray-700">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-8 w-8 text-yellow-300 mr-3" />
            <h2 className="text-2xl font-semibold">Coach Dashboard V2 (AI)</h2>
          </div>
          <p className="text-gray-200 mb-6">Next-gen AI-powered dashboard for coaches. Try the new experience!</p>
          <Link
            href="/coach/dashboardv2"
            className={`block w-full py-2 px-4 text-center rounded ${
              ['admin', 'coach'].includes(user?.role || '')
                ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-300'
                : 'bg-gray-700 cursor-not-allowed text-gray-400'
            }`}
          >
            {['admin', 'coach'].includes(user?.role || '')
              ? 'Try AI Dashboard'
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

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <button
          onClick={handleTestFeedback}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Test Feedback
        </button>
        <Link
          href="/coach/clients/1"
          className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 block text-center"
        >
          Go to Coach's Test Client Profile (AI Insights, Notes, History)
        </Link>
        <button
          onClick={() => setFeedbackOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Send Feedback
        </button>
        <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      </div>
    </main>
  );
}
