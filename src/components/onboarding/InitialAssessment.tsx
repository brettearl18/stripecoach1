'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { saveInitialAssessment, InitialAssessmentData } from '@/lib/services/assessmentService';
import { ScaleIcon, MoonIcon, BoltIcon, HeartIcon, SparklesIcon, FireIcon } from '@heroicons/react/24/outline';

const dietaryOptions = [
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Dairy-free',
  'Keto',
  'Paleo',
  'None'
];

const ratingOptions = ['Low', 'Moderate', 'High'];
const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'];

export default function InitialAssessment() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<InitialAssessmentData, 'completedAt'>>({
    currentWeight: '',
    targetWeight: '',
    sleepHours: '',
    energyLevel: 'Moderate',
    stressLevel: 'Moderate',
    fitnessLevel: 'Beginner',
    dietaryRestrictions: [],
    injuries: ''
  });

  const handleInputChange = (field: keyof InitialAssessmentData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.currentWeight && formData.targetWeight;
      case 2:
        return formData.sleepHours && formData.energyLevel && formData.stressLevel;
      case 3:
        return formData.fitnessLevel !== undefined;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.uid) return;
    
    setIsSubmitting(true);
    try {
      const result = await saveInitialAssessment(user.uid, formData);
      if (result.success) {
        router.push('/client/dashboard');
      } else {
        console.error('Failed to save assessment');
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-primary-600">
                {Math.round((currentStep / 3) * 100)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
            <div
              style={{ width: `${(currentStep / 3) * 100}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 transition-all duration-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ScaleIcon className="w-6 h-6" />
              Physical Stats
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Weight (lbs)</label>
                <input
                  type="number"
                  value={formData.currentWeight}
                  onChange={(e) => handleInputChange('currentWeight', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your current weight"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Weight (lbs)</label>
                <input
                  type="number"
                  value={formData.targetWeight}
                  onChange={(e) => handleInputChange('targetWeight', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter your target weight"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MoonIcon className="w-6 h-6" />
              Lifestyle & Wellness
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Average Sleep Hours</label>
                <input
                  type="number"
                  value={formData.sleepHours}
                  onChange={(e) => handleInputChange('sleepHours', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Hours per night"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Energy Level</label>
                <select
                  value={formData.energyLevel}
                  onChange={(e) => handleInputChange('energyLevel', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {ratingOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stress Level</label>
                <select
                  value={formData.stressLevel}
                  onChange={(e) => handleInputChange('stressLevel', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {ratingOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FireIcon className="w-6 h-6" />
              Fitness & Health
            </h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fitness Level</label>
                <select
                  value={formData.fitnessLevel}
                  onChange={(e) => handleInputChange('fitnessLevel', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {fitnessLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dietary Restrictions</label>
                <div className="grid grid-cols-2 gap-2">
                  {dietaryOptions.map(option => (
                    <label key={option} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.dietaryRestrictions.includes(option)}
                        onChange={(e) => {
                          const newRestrictions = e.target.checked
                            ? [...formData.dietaryRestrictions, option]
                            : formData.dietaryRestrictions.filter(r => r !== option);
                          handleInputChange('dietaryRestrictions', newRestrictions);
                        }}
                        className="rounded"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Current/Past Injuries</label>
                <textarea
                  value={formData.injuries}
                  onChange={(e) => handleInputChange('injuries', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Describe any injuries or physical limitations..."
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-6">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            Back
          </button>
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid(currentStep)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isStepValid(currentStep)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 