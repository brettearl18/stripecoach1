'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ClientProfileModal } from '@/components/checkIn/ClientProfileModal';
import { InitialAssessment } from '@/components/onboarding/InitialAssessment';

export default function SignUpPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError('');
      setLoading(true);
      console.log('Starting email signup...');
      await signUpWithEmail(email, password);
      console.log('Signup successful, showing profile modal');
      setShowProfileModal(true);
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError('');
      setLoading(true);
      console.log('Starting Google signup...');
      await signInWithGoogle();
      console.log('Google signup successful, showing profile modal');
      setShowProfileModal(true);
    } catch (error: any) {
      console.error('Google signup error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleTestSignUp = async () => {
    try {
      setError('');
      setLoading(true);
      console.log('Starting test signup...');
      // Use a test email and password
      await signUpWithEmail('test@example.com', 'test123456');
      console.log('Test signup successful, showing profile modal');
      setShowProfileModal(true);
    } catch (error: any) {
      console.error('Test signup error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleProfileComplete = async (profile: any) => {
    try {
      console.log('Profile completed:', profile);
      // Save profile data
      setShowProfileModal(false);
      console.log('Profile modal closed, showing assessment');
      setShowAssessment(true);
    } catch (error: any) {
      console.error('Profile completion error:', error);
      setError(error.message);
    }
  };

  const handleAssessmentComplete = async (assessment: any) => {
    try {
      console.log('Assessment completed:', assessment);
      // Save assessment data
      setShowAssessment(false);
      setLoading(false);
      console.log('Redirecting to dashboard');
      router.replace('/client/dashboard');
    } catch (error: any) {
      console.error('Assessment completion error:', error);
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleEmailSignUp}>
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <img
                className="h-5 w-5 mr-2"
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google logo"
              />
              Sign up with Google
            </button>

            <button
              onClick={handleTestSignUp}
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-green-600 rounded-md shadow-sm text-sm font-medium text-green-300 bg-gray-800 hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              Use Test Account
            </button>
          </div>
        </div>

        <div className="text-sm text-center">
          <Link
            href="/login"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>

      <ClientProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileComplete={handleProfileComplete}
      />

      <InitialAssessment
        isOpen={showAssessment}
        onClose={() => setShowAssessment(false)}
        onComplete={handleAssessmentComplete}
      />
    </div>
  );
} 