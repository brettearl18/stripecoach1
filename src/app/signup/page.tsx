'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ClientProfileModal } from '@/components/checkIn/ClientProfileModal';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { saveAssessmentProgress, getAssessmentProgress, deleteAssessmentProgress } from '@/lib/services/assessmentService';
import { getAuth } from 'firebase/auth';

// Dynamically import InitialAssessment with no SSR
const InitialAssessment = dynamic(
  () => import('@/components/onboarding/InitialAssessment'),
  { ssr: false }
);

const SignUpPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteId = searchParams.get('invite');
  const { signUpWithEmail, signInWithGoogle, error: authError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentData, setAssessmentData] = useState<any>(null);

  // DEVELOPMENT ONLY: Auto-bypass auth
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Bypassing authentication');
      setShowProfileModal(true);
    }
  }, []);

  // Placeholder coach info (in a real app, fetch from inviteId)
  const coachName = 'Your Coach';
  const coachPhoto = 'https://app.vanahealth.com/logo.png';
  const primaryColor = '#4F46E5';

  // Clear any existing assessment data when component mounts
  useEffect(() => {
    const cleanup = async () => {
      try {
        const auth = getAuth();
        if (auth.currentUser) {
          await deleteAssessmentProgress(auth.currentUser.uid);
        }
      } catch (error) {
        console.error('Error cleaning up assessment data:', error);
      }
    };
    cleanup();
  }, []);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      console.log('Starting email signup...');
      await signUpWithEmail(email, password);
      console.log('Signup successful, showing profile modal');
      setShowProfileModal(true);
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to sign up. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('Starting Google signup...');
      await signInWithGoogle();
      console.log('Google signup successful, showing profile modal');
      setShowProfileModal(true);
    } catch (error: any) {
      console.error('Google signup error:', error);
      setError(error.message || 'Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  const handleTestSignUp = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('Starting test signup...');
      // Use a test email and password
      await signUpWithEmail('test@example.com', 'test123456');
      console.log('Test signup successful, showing profile modal');
      setShowProfileModal(true);
    } catch (error: any) {
      console.error('Test signup error:', error);
      setError(error.message || 'Failed to create test account. Please try again.');
      setLoading(false);
    }
  };

  const handleProfileComplete = async (profileData: any) => {
    try {
      console.log('Profile completed:', profileData);
      setError(null);
      setLoading(true);
      
      const auth = getAuth();
      if (!auth.currentUser) {
        throw new Error('No authenticated user found');
      }

      // Save profile data
      await saveAssessmentProgress(auth.currentUser.uid, {
        profile: profileData,
        timestamp: new Date().toISOString()
      });

      setShowProfileModal(false);
      console.log('Profile modal closed, showing assessment');
      setShowAssessment(true);
    } catch (error: any) {
      console.error('Profile completion error:', error);
      setError(error.message || 'Failed to save profile. Please try again.');
      setLoading(false);
    }
  };

  const handleAssessmentComplete = async (assessmentData: any) => {
    try {
      console.log('Assessment completed:', assessmentData);
      setError(null);
      setLoading(true);
      
      const auth = getAuth();
      if (!auth.currentUser) {
        throw new Error('No authenticated user found');
      }

      // Save assessment data
      await saveAssessmentProgress(auth.currentUser.uid, {
        ...assessmentData,
        timestamp: new Date().toISOString()
      });

      setShowAssessment(false);
      setLoading(false);
      console.log('Redirecting to dashboard');
      router.replace('/client/dashboard');
    } catch (error: any) {
      console.error('Assessment completion error:', error);
      setError(error.message || 'Failed to save assessment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        {inviteId && (
          <div className="mb-6 rounded-xl overflow-hidden shadow" style={{ background: '#fff' }}>
            <div style={{ background: primaryColor, padding: '20px 0', textAlign: 'center' }}>
              <img src={coachPhoto} alt="Vana Health Logo" style={{ height: 48, borderRadius: '50%', background: '#fff', padding: 4, margin: '0 auto 8px' }} />
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Welcome to Vana Health!</h2>
            </div>
            <div style={{ padding: '20px 20px 10px 20px', color: '#222' }}>
              <p style={{ fontWeight: 500, marginBottom: 8 }}>You've been invited to join a coaching program.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <img src={coachPhoto} alt="Coach Avatar" style={{ width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6' }} />
                <span style={{ fontWeight: 600 }}>{coachName}</span>
              </div>
              <div style={{ margin: '12px 0 0 0' }}>
                <b>What to expect:</b>
                <ul style={{ margin: '8px 0 0 20px', color: '#444', fontSize: '0.97rem' }}>
                  <li>Set up your profile and preferences</li>
                  <li>Choose your health and fitness goals</li>
                  <li>Connect with your coach for personalized support</li>
                  <li>Track your progress and celebrate wins!</li>
                </ul>
              </div>
            </div>
          </div>
        )}
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

      {showProfileModal && (
        <ClientProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onProfileComplete={handleProfileComplete}
        />
      )}

      {showAssessment && (
        <InitialAssessment
          isOpen={showAssessment}
          onClose={() => setShowAssessment(false)}
          onComplete={handleAssessmentComplete}
        />
      )}
    </div>
  );
};

export default SignUpPage; 