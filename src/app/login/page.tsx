'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { UserRole } from '@/types/user';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const RouteStatus = ({ isBuilt }: { isBuilt: boolean }) => {
  if (isBuilt) {
    return <CheckCircleIcon className="h-4 w-4 text-emerald-500 inline-block ml-2" />;
  }
  return <XCircleIcon className="h-4 w-4 text-red-500 inline-block ml-2" />;
};

const PageLink = ({ name, path, isBuilt }: { name: string; path: string; isBuilt: boolean }) => (
  <li className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-600/30">
    <span className="text-gray-300">
      {name}
      <span className="text-gray-500 text-sm ml-2">({path})</span>
    </span>
    <RouteStatus isBuilt={isBuilt} />
  </li>
);

const AccessibleRoutes = () => {
  return (
    <div className="mt-8 bg-gray-700/50 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-6">Available Pages by Role</h2>
      
      <div className="grid gap-8 md:grid-cols-3">
        {/* Admin Routes */}
        <div className="space-y-4">
          <h3 className="text-lg text-blue-400 font-medium border-b border-blue-400/20 pb-2">
            Admin Access
          </h3>
          <ul className="space-y-1">
            <PageLink name="Dashboard" path="/admin/dashboard" isBuilt={true} />
            <PageLink name="Coaches" path="/admin/coaches" isBuilt={true} />
            <PageLink name="Clients" path="/admin/clients" isBuilt={true} />
            <PageLink name="Analytics" path="/admin/analytics" isBuilt={true} />
            <PageLink name="Programs" path="/admin/programs" isBuilt={true} />
            <PageLink name="Reports" path="/admin/reports" isBuilt={true} />
            <PageLink name="Settings" path="/admin/settings" isBuilt={true} />
            <PageLink name="Messages" path="/admin/messages" isBuilt={true} />
            <PageLink name="Check-ins" path="/admin/check-ins" isBuilt={true} />
            <PageLink name="Billing" path="/admin/billing" isBuilt={false} />
          </ul>
          <p className="text-emerald-400 text-sm mt-4 pt-2 border-t border-gray-600">
            + Access to all Coach & Client pages
          </p>
        </div>

        {/* Coach Routes */}
        <div className="space-y-4">
          <h3 className="text-lg text-emerald-400 font-medium border-b border-emerald-400/20 pb-2">
            Coach Access
          </h3>
          <ul className="space-y-1">
            <PageLink name="Dashboard" path="/coach/dashboard" isBuilt={true} />
            <PageLink name="Clients" path="/coach/clients" isBuilt={true} />
            <PageLink name="Templates" path="/coach/templates" isBuilt={true} />
            <PageLink name="Settings" path="/coach/settings" isBuilt={true} />
            <PageLink name="Forms" path="/coach/forms" isBuilt={true} />
            <PageLink name="Check-ins" path="/coach/check-ins" isBuilt={true} />
            <PageLink name="Programs" path="/coach/programs" isBuilt={false} />
          </ul>
          <p className="text-emerald-400 text-sm mt-4 pt-2 border-t border-gray-600">
            + Access to all Client pages
          </p>
        </div>

        {/* Client Routes */}
        <div className="space-y-4">
          <h3 className="text-lg text-purple-400 font-medium border-b border-purple-400/20 pb-2">
            Client Access
          </h3>
          <ul className="space-y-1">
            <PageLink name="Dashboard" path="/client/dashboard" isBuilt={true} />
            <PageLink name="Check-ins" path="/client/check-ins" isBuilt={true} />
            <PageLink name="Photos" path="/client/photos" isBuilt={true} />
            <PageLink name="Measurements" path="/client/measurements" isBuilt={true} />
            <PageLink name="Messages" path="/client/messages" isBuilt={true} />
            <PageLink name="Forms" path="/client/forms" isBuilt={true} />
            <PageLink name="Coach" path="/client/coach" isBuilt={true} />
          </ul>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-6 text-sm text-gray-400 border-t border-gray-600 pt-4">
        <div className="flex items-center">
          <CheckCircleIcon className="h-4 w-4 text-emerald-500 mr-2" />
          Built & Ready
        </div>
        <div className="flex items-center">
          <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
          Coming Soon
        </div>
      </div>
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('coach');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      
      // Determine redirect path based on role
      let redirectPath = '/';
      switch (role) {
        case 'coach':
          redirectPath = '/coach/dashboard';
          break;
        case 'client':
          redirectPath = '/client/dashboard';
          break;
        case 'admin':
          redirectPath = '/admin/dashboard';
          break;
      }
      
      router.push(redirectPath);
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Failed to sign in. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Log In to Checkin.io
          </h2>
        </div>
        
        {/* Show any error messages */}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white bg-gray-800 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-2">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="coach">Coach</option>
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="text-sm text-gray-400">
            <p className="mb-2">Available test accounts:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Admin: admin@stripecoach.com</li>
              <li>Coach: michael.c@stripecoach.com</li>
              <li>Client: john@example.com</li>
            </ul>
            <p className="mt-4 text-xs">Note: This is a development login page. In production, proper authentication would be implemented.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 