'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { UserRole } from '@/types/user';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { signIn } from 'next-auth/react';

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
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        role,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      // Handle role-based routing
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
      console.error('Login error:', error);
      toast.error('Failed to log in.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    try {
      await signIn(provider, {
        callbackUrl: `${window.location.origin}/${role}/dashboard`,
      });
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`Failed to log in with ${provider}.`);
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
        
        <div className="mt-8 space-y-6">
          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm bg-[#1877F2] text-sm font-medium text-white hover:bg-[#166FE5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Role Selector */}
            <div className="mt-4">
              <label htmlFor="role" className="block text-sm font-medium text-gray-400 mb-1">
                Select Role
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="block w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="coach">Coach</option>
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-700 rounded bg-gray-800"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="/forgot-password" className="font-medium text-indigo-400 hover:text-indigo-300">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>

        <AccessibleRoutes />
      </div>
    </div>
  );
} 