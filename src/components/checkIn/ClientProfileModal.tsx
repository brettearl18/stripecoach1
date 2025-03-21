'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

interface ClientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileComplete: (profile: ClientProfile) => void;
}

export interface ClientProfile {
  age: string;
  gender: string;
  lifestyle: string;
  gymAccess: string;
  goals: string[];
  focusAreas: string[];
}

export function ClientProfileModal({ isOpen, onClose, onProfileComplete }: ClientProfileModalProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<ClientProfile>({
    age: '',
    gender: '',
    lifestyle: '',
    gymAccess: '',
    goals: [],
    focusAreas: []
  });

  const steps = [
    {
      title: "Basic Information",
      fields: [
        {
          id: 'age',
          label: 'Age Range',
          type: 'select',
          options: ['18-24', '25-34', '35-44', '45-54', '55+']
        },
        {
          id: 'gender',
          label: 'Gender',
          type: 'select',
          options: ['Male', 'Female', 'Other', 'Prefer not to say']
        }
      ]
    },
    {
      title: "Lifestyle & Access",
      fields: [
        {
          id: 'lifestyle',
          label: 'Work/Life Schedule',
          type: 'select',
          options: [
            'Office worker (9-5)',
            'Shift worker',
            'Work from home',
            'Stay at home parent',
            'Student',
            'Other'
          ]
        },
        {
          id: 'gymAccess',
          label: 'Training Environment',
          type: 'select',
          options: [
            'Home gym setup',
            'Commercial gym membership',
            'Limited equipment at home',
            'No equipment (bodyweight only)',
            'Outdoor training preference'
          ]
        }
      ]
    },
    {
      title: "Goals",
      description: "What do you want to achieve? (Select all that apply)",
      type: 'checkbox',
      options: [
        { id: 'weight-loss-small', label: 'Weight Loss (<5kg)', category: 'Weight Management' },
        { id: 'weight-loss-medium', label: 'Weight Loss (5-10kg)', category: 'Weight Management' },
        { id: 'weight-loss-large', label: 'Weight Loss (10kg+)', category: 'Weight Management' },
        { id: 'muscle-gain', label: 'Build Muscle', category: 'Body Composition' },
        { id: 'strength', label: 'Increase Strength', category: 'Performance' },
        { id: 'endurance', label: 'Improve Endurance', category: 'Performance' },
        { id: 'flexibility', label: 'Increase Flexibility', category: 'Movement' },
        { id: 'gut-health', label: 'Better Gut Health', category: 'Health' },
        { id: 'energy', label: 'More Energy', category: 'Wellness' },
        { id: 'stress', label: 'Stress Management', category: 'Wellness' },
        { id: 'sleep', label: 'Better Sleep', category: 'Recovery' }
      ]
    },
    {
      title: "Focus Areas",
      description: "Which areas would you like to track? (Select all that apply)",
      type: 'checkbox',
      options: [
        { id: 'nutrition', label: 'Nutrition', category: 'Lifestyle' },
        { id: 'training', label: 'Training', category: 'Physical' },
        { id: 'sleep', label: 'Sleep', category: 'Recovery' },
        { id: 'stress', label: 'Stress Management', category: 'Mental' },
        { id: 'habits', label: 'Daily Habits', category: 'Behavior' },
        { id: 'mindset', label: 'Mindset', category: 'Mental' },
        { id: 'energy', label: 'Energy Levels', category: 'Wellness' },
        { id: 'recovery', label: 'Recovery', category: 'Physical' },
        { id: 'motivation', label: 'Motivation', category: 'Mental' }
      ]
    }
  ];

  const currentStep = steps[step - 1];

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      onProfileComplete(profile);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const isStepValid = () => {
    if (step === 1) {
      return profile.age && profile.gender;
    }
    if (step === 2) {
      return profile.lifestyle && profile.gymAccess;
    }
    if (step === 3) {
      return profile.goals.length > 0;
    }
    if (step === 4) {
      return profile.focusAreas.length > 0;
    }
    return false;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-[#1A1F26] p-6 shadow-xl transition-all">
                <div className="mb-8">
                  <Dialog.Title className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-indigo-500" />
                    {currentStep.title}
                  </Dialog.Title>
                  {currentStep.description && (
                    <Dialog.Description className="text-sm text-gray-400">
                      {currentStep.description}
                    </Dialog.Description>
                  )}
                </div>

                <div className="space-y-6">
                  {currentStep.type === 'checkbox' ? (
                    <div className="grid grid-cols-2 gap-4">
                      {currentStep.options.map((option) => (
                        <label
                          key={option.id}
                          className="flex items-start gap-3 p-3 bg-[#2A303A] rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={profile[step === 3 ? 'goals' : 'focusAreas'].includes(option.id)}
                            onChange={() => handleCheckboxChange(step === 3 ? 'goals' : 'focusAreas', option.id)}
                            className="mt-1 h-4 w-4 rounded border-gray-700 bg-[#2A303A] text-indigo-600 focus:ring-indigo-600 focus:ring-offset-0"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                              {option.label}
                            </p>
                            <p className="text-xs text-gray-400">{option.category}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    currentStep.fields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-200">
                          {field.label}
                        </label>
                        <select
                          value={profile[field.id]}
                          onChange={(e) => handleSelectChange(field.id, e.target.value)}
                          className="w-full px-4 py-2 bg-[#2A303A] rounded-lg border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))
                  )}

                  <div className="flex justify-between pt-6">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={step === 1}
                      className="px-4 py-2 text-sm text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!isStepValid()}
                      className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {step === steps.length ? 'Create Profile' : 'Next'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 