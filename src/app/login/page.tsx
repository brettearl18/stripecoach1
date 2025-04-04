'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
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
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Normalize email to lowercase
      const normalizedEmail = email.toLowerCase().trim();
      console.log('Attempting to sign in with:', { email: normalizedEmail, role });
      
      await signIn(normalizedEmail, role);
      console.log('Sign in successful');
      
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
      
      console.log('Redirecting to:', redirectPath);
      
      // Force a hard navigation to ensure fresh state
      window.location.href = redirectPath;
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in. Please check your email and role.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-[75%] border border-gray-700">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Log In to Checkin.io</h1>

        <div className="grid md:grid-cols-[1fr,2fr] gap-8">
          <div>
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="coach">Coach</option>
                  <option value="client">Client</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded font-medium text-white ${
                  loading
                    ? 'bg-blue-500/50 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 text-sm text-gray-400">
              <p className="text-center">Available test accounts:</p>
              <ul className="mt-2 space-y-1 text-center">
                <li>Admin: admin@stripecoach.com</li>
                <li>Coach: michael.c@stripecoach.com</li>
                <li>Client: john@example.com</li>
              </ul>
            </div>

            <p className="mt-4 text-sm text-gray-400 text-center">
              Note: This is a development login page. In production, proper authentication would be implemented.
            </p>
          </div>

          <AccessibleRoutes />
        </div>
      </div>
    </div>
  );
} 