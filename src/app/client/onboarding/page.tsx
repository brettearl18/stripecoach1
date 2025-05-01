'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { saveOnboardingProgress } from '@/lib/services/onboardingConfigService';
import { UserIcon, ClipboardDocumentCheckIcon, CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import ProfileSetup from '@/components/onboarding/ProfileSetup';
import GoalSelection from '@/components/onboarding/GoalSelection';
import InitialAssessment from '@/components/onboarding/InitialAssessment';

const steps = [
  {
    id: 'profile',
    title: 'Profile Setup',
    description: 'Tell us about yourself',
    icon: UserIcon
  },
  {
    id: 'goals',
    title: 'Goal Selection',
    description: 'Choose your focus areas',
    icon: ClipboardDocumentCheckIcon
  },
  {
    id: 'assessment',
    title: 'Initial Assessment',
    description: 'Complete your assessment',
    icon: CheckCircleIcon
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState('profile');
  const [profileData, setProfileData] = useState<any>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate progress percentage
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleProfileComplete = async (data: any) => {
    setProfileData(data);
    setCurrentStep('goals');
  };

  const handleGoalsSelected = async (goals: string[]) => {
    setSelectedGoals(goals);
    setCurrentStep('assessment');
  };

  const handleAssessmentComplete = async (data: any) => {
    if (!user?.uid) return;
    
    setIsSubmitting(true);
    try {
      await saveOnboardingProgress(user.uid, {
        profile: profileData,
        goals: selectedGoals,
        assessment: data,
        completedAt: new Date().toISOString()
      });
      
      router.push('/client/dashboard');
    } catch (error) {
      console.error('Error saving onboarding progress:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Enhanced Progress UI */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white">Getting Started</h2>
            <div className="text-sm font-medium text-gray-400">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
          </div>
          
          {/* Visual Progress Bar */}
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  {steps[currentStepIndex].title}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {progress.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
              <div
                style={{ width: `${progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="grid grid-cols-3 gap-2">
            {steps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isCompleted = index < currentStepIndex;
              return (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    isCompleted ? 'text-green-500' : isActive ? 'text-blue-500' : 'text-gray-600'
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border-2 
                    ${isCompleted ? 'border-green-500 bg-green-500/10' : 
                      isActive ? 'border-blue-500 bg-blue-500/10' : 
                      'border-gray-600 bg-gray-600/10'}`}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <span className="text-sm">{index + 1}</span>
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6">
          {currentStep === 'profile' && (
            <ProfileSetup onComplete={handleProfileComplete} />
          )}

          {currentStep === 'goals' && (
            <GoalSelection
              onGoalsSelected={handleGoalsSelected}
              initialSelectedGoals={selectedGoals}
            />
          )}

          {currentStep === 'assessment' && (
            <InitialAssessment
              isOpen={true}
              onClose={() => {}}
              onComplete={handleAssessmentComplete}
              selectedGoals={selectedGoals}
            />
          )}
        </div>
      </div>
    </div>
  );
} 