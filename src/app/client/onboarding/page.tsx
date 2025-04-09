'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClientProfileModal, ClientProfile } from '@/components/checkIn/ClientProfileModal';
import { InitialAssessment } from '@/components/onboarding/InitialAssessment';
import { createClientProfile } from '@/lib/services/clientProfileService';
import { getAuth } from 'firebase/auth';
import {
  UserIcon,
  ClipboardDocumentCheckIcon,
  AcademicCapIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const steps = [
  { id: 'profile', name: 'Profile Setup', icon: UserIcon },
  { id: 'assessment', name: 'Initial Assessment', icon: ClipboardDocumentCheckIcon },
  { id: 'program', name: 'Program Selection', icon: AcademicCapIcon },
  { id: 'complete', name: 'All Set!', icon: CheckCircleIcon }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState('profile');
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [assessment, setAssessment] = useState(null);
  const [program, setProgram] = useState(null);
  const router = useRouter();
  const auth = getAuth();

  // Show progress steps
  const renderSteps = () => (
    <nav className="mb-8">
      <ol className="flex items-center justify-center space-x-8">
        {steps.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isComplete = steps.findIndex(s => s.id === currentStep) > index;
          
          return (
            <li key={step.id} className="relative">
              <div className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isComplete ? 'bg-green-600' : isCurrent ? 'bg-blue-600' : 'bg-gray-700'}
                `}>
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <span className={`
                  ml-3 text-sm font-medium
                  ${isCurrent ? 'text-white' : 'text-gray-400'}
                `}>
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-5 left-full w-24 h-px bg-gray-700" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );

  // Handle profile completion
  const handleProfileComplete = async (profileData: ClientProfile) => {
    if (!auth.currentUser) {
      router.push('/login');
      return;
    }

    try {
      const result = await createClientProfile(auth.currentUser.uid, profileData);
      if (result) {
        setProfile(profileData);
        setCurrentStep('assessment');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  // Handle assessment completion
  const handleAssessmentComplete = (assessmentData: any) => {
    setAssessment(assessmentData);
    setCurrentStep('program');
  };

  // Handle program selection
  const handleProgramSelect = (programData: any) => {
    setProgram(programData);
    setCurrentStep('complete');
  };

  // Handle completion
  const handleComplete = () => {
    router.push('/client/dashboard');
  };

  return (
    <div className="w-full">
      {renderSteps()}

      <div className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
        {currentStep === 'profile' && (
          <ClientProfileModal
            isOpen={true}
            onClose={() => {}}
            onProfileComplete={handleProfileComplete}
          />
        )}

        {currentStep === 'assessment' && (
          <InitialAssessment
            isOpen={true}
            onClose={() => {}}
            onComplete={handleAssessmentComplete}
          />
        )}

        {currentStep === 'program' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Choose Your Program</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add program options here */}
              <button
                onClick={() => handleProgramSelect({ type: 'strength' })}
                className="p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <h3 className="text-xl font-semibold text-white mb-2">Strength Training</h3>
                <p className="text-gray-300">Focus on building strength and muscle</p>
              </button>
              <button
                onClick={() => handleProgramSelect({ type: 'weight-loss' })}
                className="p-6 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <h3 className="text-xl font-semibold text-white mb-2">Weight Loss</h3>
                <p className="text-gray-300">Focus on sustainable fat loss</p>
              </button>
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">You're All Set!</h2>
            <p className="text-gray-300 mb-8">Your profile is complete and your program is ready.</p>
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 