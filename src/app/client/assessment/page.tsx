'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { hasCompletedAssessment } from '@/lib/services/assessmentService';
import InitialAssessment from './components/InitialAssessment';

export default function AssessmentPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const checkAssessment = async () => {
      if (!user?.uid) return;
      
      try {
        const completed = await hasCompletedAssessment(user.uid);
        if (completed) {
          router.push('/client/dashboard');
        }
      } catch (error) {
        console.error('Error checking assessment status:', error);
      }
    };

    if (!isLoading) {
      checkAssessment();
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Initial Assessment</h1>
          <p className="mt-2 text-gray-600">
            Help us understand your fitness journey better by completing this assessment.
          </p>
        </div>
        <InitialAssessment />
      </div>
    </div>
  );
} 