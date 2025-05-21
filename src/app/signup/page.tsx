'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClientProfileModal } from '@/components/checkIn/ClientProfileModal';
import { InitialAssessment } from '@/components/onboarding/InitialAssessment';

const SignUpPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);

  const handleProfileComplete = async (profileData: any) => {
    try {
      console.log('Profile completed:', profileData);
      setError(null);
      setLoading(true);
      
      // Save profile data using NextAuth session
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: profileData,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

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

      // Save assessment data
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assessment: assessmentData,
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save assessment');
      }

      setShowAssessment(false);
      router.push('/client/dashboard');
    } catch (error: any) {
      console.error('Assessment completion error:', error);
      setError(error.message || 'Failed to save assessment. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <button
              onClick={() => signIn('google')}
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              sign in with Google
            </button>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        )}

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
    </div>
  );
};

export default SignUpPage; 