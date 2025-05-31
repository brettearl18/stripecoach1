'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase-client';
import ProfileSetup from '@/components/onboarding/ProfileSetup';
import InitialAssessment from '@/components/onboarding/InitialAssessment';

const steps = [
  'Profile Setup',
  'Initial Assessment',
  'Review & Complete'
];

export default function ClientOnboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    goals: [] as string[],
    assessmentData: null as any,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
      if (user && user.email) {
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleProfileComplete = (data: any) => {
    setFormData(prev => ({
      ...prev,
      ...data,
    }));
    setCurrentStep(1);
  };

  const handleAssessmentComplete = (data: any) => {
    setFormData(prev => ({
      ...prev,
      assessmentData: data,
    }));
    setCurrentStep(2);
  };

  const handleSubmit = async () => {
    if (!firebaseUser) return;

    setSaving(true);
    setError('');

    try {
      // Save client profile to Firestore
      await setDoc(doc(db, 'clients', firebaseUser.uid), {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        goals: formData.goals,
        assessmentData: formData.assessmentData,
        onboardingCompleted: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setCompleted(true);
      // Redirect to client dashboard after a short delay
      setTimeout(() => {
        router.push('/client/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Onboarding save error:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!firebaseUser) {
    router.push('/auth/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-indigo-800 dark:text-white mb-8">
            Welcome to Your Coaching Journey!
          </h1>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {steps[currentStep]}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {!completed ? (
            <>
              {currentStep === 0 && (
                <ProfileSetup onComplete={handleProfileComplete} />
              )}

              {currentStep === 1 && (
                <InitialAssessment
                  isOpen={true}
                  onClose={() => {}}
                  onComplete={handleAssessmentComplete}
                  selectedGoals={formData.goals}
                />
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Review Your Information
                  </h3>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">Profile Information</h4>
                      <p className="text-gray-600 dark:text-gray-400">Name: {formData.fullName}</p>
                      <p className="text-gray-600 dark:text-gray-400">Email: {formData.email}</p>
                      <p className="text-gray-600 dark:text-gray-400">Phone: {formData.phone}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">Selected Goals</h4>
                      <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                        {formData.goals.map((goal, index) => (
                          <li key={index}>{goal}</li>
                        ))}
                      </ul>
                    </div>

                    {formData.assessmentData && (
                      <div>
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">Assessment Results</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          Completed on: {new Date(formData.assessmentData.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}

                  <div className="flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Complete Setup'}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="text-green-500 text-lg font-semibold mb-4">
                Profile setup complete!
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Redirecting to your dashboard...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 