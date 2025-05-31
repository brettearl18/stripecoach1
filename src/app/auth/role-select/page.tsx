'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase-client';
import { useAuth } from '@/hooks/useAuth';

export default function RoleSelection() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'coach' | 'client' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = async (role: 'coach' | 'client') => {
    if (!user) {
      setError('Please sign in first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Save role to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        role,
        onboardingCompleted: false,
        createdAt: new Date().toISOString()
      }, { merge: true });

      // Redirect to appropriate onboarding
      router.push(`/${role}/onboarding`);
    } catch (error) {
      console.error('Error saving role:', error);
      setError('Failed to save role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Choose Your Role
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Select how you'll use the platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleRoleSelect('coach')}
              disabled={loading}
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Saving...' : 'I am a Coach'}
            </button>

            <button
              onClick={() => handleRoleSelect('client')}
              disabled={loading}
              className={`w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'Saving...' : 'I am a Client'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 