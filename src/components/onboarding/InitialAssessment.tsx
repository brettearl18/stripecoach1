'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  HeartIcon,
  ScaleIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface InitialAssessmentProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (assessment: InitialAssessmentData) => void;
}

interface InitialAssessmentData {
  healthStatus: {
    currentWeight?: number;
    targetWeight?: number;
    height?: number;
    medicalConditions: string[];
    medications: string[];
    injuries: string[];
  };
  fitnessLevel: {
    exerciseFrequency: string;
    exerciseTypes: string[];
    fitnessGoals: string[];
    strengthLevel: string;
  };
  nutritionHabits: {
    dietaryRestrictions: string[];
    mealFrequency: string;
    waterIntake: string;
    supplements: string[];
  };
  schedulePreferences: {
    preferredTimes: string[];
    sessionDuration: string;
    weeklyFrequency: number;
    timezone: string;
  };
}

export function InitialAssessment({ isOpen, onClose, onComplete }: InitialAssessmentProps) {
  const [step, setStep] = useState(1);
  const [assessment, setAssessment] = useState<InitialAssessmentData>({
    healthStatus: {
      medicalConditions: [],
      medications: [],
      injuries: [],
    },
    fitnessLevel: {
      exerciseFrequency: '',
      exerciseTypes: [],
      fitnessGoals: [],
      strengthLevel: '',
    },
    nutritionHabits: {
      dietaryRestrictions: [],
      mealFrequency: '',
      waterIntake: '',
      supplements: [],
    },
    schedulePreferences: {
      preferredTimes: [],
      sessionDuration: '',
      weeklyFrequency: 3,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  const steps = [
    {
      title: "Current Health Status",
      icon: HeartIcon,
      fields: [
        {
          id: 'currentWeight',
          label: 'Current Weight (kg)',
          type: 'number',
          section: 'healthStatus',
        },
        {
          id: 'targetWeight',
          label: 'Target Weight (kg)',
          type: 'number',
          section: 'healthStatus',
        },
        {
          id: 'height',
          label: 'Height (cm)',
          type: 'number',
          section: 'healthStatus',
        },
        {
          id: 'medicalConditions',
          label: 'Medical Conditions',
          type: 'multiselect',
          section: 'healthStatus',
          options: ['None', 'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Other'],
        },
      ],
    },
    {
      title: "Fitness Level",
      icon: ScaleIcon,
      fields: [
        {
          id: 'exerciseFrequency',
          label: 'Current Exercise Frequency',
          type: 'select',
          section: 'fitnessLevel',
          options: [
            'Never',
            '1-2 times per week',
            '3-4 times per week',
            '5+ times per week',
          ],
        },
        {
          id: 'exerciseTypes',
          label: 'Types of Exercise',
          type: 'multiselect',
          section: 'fitnessLevel',
          options: [
            'Weight Training',
            'Cardio',
            'Yoga',
            'Sports',
            'None',
          ],
        },
        {
          id: 'strengthLevel',
          label: 'Current Strength Level',
          type: 'select',
          section: 'fitnessLevel',
          options: [
            'Beginner',
            'Intermediate',
            'Advanced',
          ],
        },
      ],
    },
    {
      title: "Nutrition Habits",
      icon: SparklesIcon,
      fields: [
        {
          id: 'dietaryRestrictions',
          label: 'Dietary Restrictions',
          type: 'multiselect',
          section: 'nutritionHabits',
          options: [
            'None',
            'Vegetarian',
            'Vegan',
            'Gluten-Free',
            'Dairy-Free',
            'Other',
          ],
        },
        {
          id: 'mealFrequency',
          label: 'Meals per Day',
          type: 'select',
          section: 'nutritionHabits',
          options: ['1-2', '3-4', '5-6', '6+'],
        },
        {
          id: 'waterIntake',
          label: 'Daily Water Intake',
          type: 'select',
          section: 'nutritionHabits',
          options: [
            'Less than 1L',
            '1-2L',
            '2-3L',
            'More than 3L',
          ],
        },
      ],
    },
    {
      title: "Schedule Preferences",
      icon: ClockIcon,
      fields: [
        {
          id: 'preferredTimes',
          label: 'Preferred Training Times',
          type: 'multiselect',
          section: 'schedulePreferences',
          options: [
            'Early Morning (5-8am)',
            'Morning (8-11am)',
            'Midday (11am-2pm)',
            'Afternoon (2-5pm)',
            'Evening (5-8pm)',
            'Late Evening (8-11pm)',
          ],
        },
        {
          id: 'sessionDuration',
          label: 'Preferred Session Duration',
          type: 'select',
          section: 'schedulePreferences',
          options: [
            '30 minutes',
            '45 minutes',
            '60 minutes',
            '90 minutes',
          ],
        },
        {
          id: 'weeklyFrequency',
          label: 'Sessions per Week',
          type: 'select',
          section: 'schedulePreferences',
          options: ['2', '3', '4', '5'],
        },
      ],
    },
  ];

  const currentStep = steps[step - 1];

  const handleInputChange = (section: string, field: string, value: any) => {
    setAssessment(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof InitialAssessmentData],
        [field]: value,
      },
    }));
  };

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      onComplete(assessment);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const isStepValid = () => {
    const currentStepFields = steps[step - 1].fields;
    return currentStepFields.every(field => {
      const sectionData = assessment[field.section as keyof InitialAssessmentData];
      const value = sectionData[field.id as keyof typeof sectionData];
      
      if (field.type === 'multiselect') {
        return Array.isArray(value) && value.length > 0;
      }
      return value !== undefined && value !== '';
    });
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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-gray-900 p-6 shadow-xl transition-all">
                <div className="mb-8">
                  <Dialog.Title className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                    <currentStep.icon className="h-5 w-5 text-blue-500" />
                    {currentStep.title}
                  </Dialog.Title>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-400">Step {step} of {steps.length}</div>
                    <div className="flex gap-1">
                      {steps.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1 w-6 rounded-full transition-colors duration-200 ${
                            index < step ? 'bg-blue-500' : 'bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {currentStep.fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        {field.label}
                      </label>
                      {field.type === 'multiselect' ? (
                        <div className="grid grid-cols-2 gap-2">
                          {field.options?.map((option) => (
                            <button
                              key={option}
                              onClick={() => {
                                const currentValue = assessment[field.section as keyof InitialAssessmentData][field.id as keyof typeof field.section] as string[];
                                const newValue = currentValue.includes(option)
                                  ? currentValue.filter(v => v !== option)
                                  : [...currentValue, option];
                                handleInputChange(field.section, field.id, newValue);
                              }}
                              className={`p-2 text-sm rounded-lg border transition-colors ${
                                (assessment[field.section as keyof InitialAssessmentData][field.id as keyof typeof field.section] as string[]).includes(option)
                                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                  : 'border-gray-700 text-gray-400 hover:border-gray-600'
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      ) : field.type === 'select' ? (
                        <select
                          value={assessment[field.section as keyof InitialAssessmentData][field.id as keyof typeof field.section] as string}
                          onChange={(e) => handleInputChange(field.section, field.id, e.target.value)}
                          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select {field.label}</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.type}
                          value={assessment[field.section as keyof InitialAssessmentData][field.id as keyof typeof field.section] as string}
                          onChange={(e) => handleInputChange(field.section, field.id, e.target.value)}
                          className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}
                    </div>
                  ))}

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
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {step === steps.length ? 'Complete Assessment' : 'Next'}
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