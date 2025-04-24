'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to Your Journey</h1>
          <p className="text-gray-400">Let's set up your personalized program</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  ${currentStep === step.id
                    ? 'bg-blue-500 text-white'
                    : currentStep === 'complete' || steps.findIndex(s => s.id === currentStep) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                  }
                `}>
                  <step.icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    flex-1 h-1 mx-2
                    ${currentStep === 'complete' || steps.findIndex(s => s.id === currentStep) > index
                      ? 'bg-green-500'
                      : 'bg-gray-700'
                    }
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            {steps.map(step => (
              <div key={step.id} className="text-center">
                <div className="font-medium">{step.title}</div>
                <div>{step.description}</div>
              </div>
            ))}
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