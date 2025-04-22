'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveAssessment } from '@/lib/services/assessmentService';
import { toast } from 'sonner';

interface FormData {
  physicalStats: {
    currentWeight: number;
    weightUnit: 'kg' | 'lbs';
    targetWeight: number;
  };
  lifestyle: {
    sleepQuality: number;
    energyLevel: number;
    stressLevel: number;
    dietaryRestrictions: string[];
  };
  fitness: {
    currentLevel: string;
    injuries: string;
    goals: string[];
  };
}

const INITIAL_FORM_DATA: FormData = {
  physicalStats: {
    currentWeight: 0,
    weightUnit: 'kg',
    targetWeight: 0,
  },
  lifestyle: {
    sleepQuality: 5,
    energyLevel: 5,
    stressLevel: 5,
    dietaryRestrictions: [],
  },
  fitness: {
    currentLevel: 'beginner',
    injuries: '',
    goals: [],
  },
};

const FITNESS_LEVELS = ['beginner', 'intermediate', 'advanced'];
const COMMON_GOALS = [
  'Weight Loss',
  'Muscle Gain',
  'Improved Fitness',
  'Better Health',
  'Stress Reduction',
  'Athletic Performance',
];
const DIETARY_RESTRICTIONS = [
  'None',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Other',
];

export default function InitialAssessment() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const updateFormData = (section: keyof FormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const validateCurrentStep = (): boolean => {
    switch (step) {
      case 1:
        return formData.physicalStats.currentWeight > 0 && formData.physicalStats.targetWeight > 0;
      case 2:
        return true; // All fields have default values
      case 3:
        return formData.fitness.goals.length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      // Use a mock user ID for testing
      await saveAssessment('test-user-123', formData);
      toast.success('Assessment completed successfully!');
      router.push('/client/dashboard');
    } catch (error) {
      toast.error('Failed to save assessment. Please try again.');
      console.error('Error saving assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, name: 'Physical Stats', description: 'Your current and target metrics' },
    { id: 2, name: 'Lifestyle', description: 'Daily habits and preferences' },
    { id: 3, name: 'Fitness Goals', description: 'Your fitness journey objectives' },
  ];

  const renderPhysicalStats = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Physical Stats</h2>
        <p className="mt-1 text-sm text-gray-500">Help us understand your current metrics</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700">Current Weight</label>
          <div className="mt-2 flex rounded-md shadow-sm">
            <input
              type="number"
              value={formData.physicalStats.currentWeight || ''}
              onChange={(e) => updateFormData('physicalStats', 'currentWeight', parseFloat(e.target.value))}
              className="block w-full rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter weight"
            />
            <select
              value={formData.physicalStats.weightUnit}
              onChange={(e) => updateFormData('physicalStats', 'weightUnit', e.target.value)}
              className="rounded-r-md border-l-0 border-gray-300 bg-gray-50 px-3 sm:text-sm"
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700">Target Weight</label>
          <div className="mt-2">
            <input
              type="number"
              value={formData.physicalStats.targetWeight || ''}
              onChange={(e) => updateFormData('physicalStats', 'targetWeight', parseFloat(e.target.value))}
              className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter target weight"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderLifestyle = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Lifestyle & Wellness</h2>
        <p className="mt-1 text-sm text-gray-500">Tell us about your daily habits and lifestyle</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
        {['Sleep Quality', 'Energy Level', 'Stress Level'].map((label, index) => {
          const key = label.toLowerCase().replace(' ', '') as keyof typeof formData.lifestyle;
          return (
            <div key={label} className="space-y-2">
              <div className="flex justify-between">
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <span className="text-sm text-gray-500">{formData.lifestyle[key]}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.lifestyle[key]}
                onChange={(e) => updateFormData('lifestyle', key, parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          );
        })}

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Dietary Restrictions</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DIETARY_RESTRICTIONS.map((restriction) => (
              <label key={restriction} className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
                <input
                  type="checkbox"
                  checked={formData.lifestyle.dietaryRestrictions.includes(restriction)}
                  onChange={(e) => {
                    const newRestrictions = e.target.checked
                      ? [...formData.lifestyle.dietaryRestrictions, restriction]
                      : formData.lifestyle.dietaryRestrictions.filter(r => r !== restriction);
                    updateFormData('lifestyle', 'dietaryRestrictions', newRestrictions);
                  }}
                  className="sr-only"
                />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">{restriction}</span>
                  </span>
                </span>
                <span 
                  className={`absolute -inset-px rounded-lg border-2 pointer-events-none ${
                    formData.lifestyle.dietaryRestrictions.includes(restriction)
                      ? 'border-blue-500'
                      : 'border-transparent'
                  }`} 
                  aria-hidden="true"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFitness = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Fitness Goals</h2>
        <p className="mt-1 text-sm text-gray-500">Set your fitness objectives and current status</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700">Current Fitness Level</label>
          <select
            value={formData.fitness.currentLevel}
            onChange={(e) => updateFormData('fitness', 'currentLevel', e.target.value)}
            className="mt-2 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
          >
            {FITNESS_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700">Current Injuries or Limitations</label>
          <textarea
            value={formData.fitness.injuries}
            onChange={(e) => updateFormData('fitness', 'injuries', e.target.value)}
            rows={3}
            className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Describe any injuries or physical limitations..."
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-3">Fitness Goals</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {COMMON_GOALS.map((goal) => (
              <label key={goal} className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none">
                <input
                  type="checkbox"
                  checked={formData.fitness.goals.includes(goal)}
                  onChange={(e) => {
                    const newGoals = e.target.checked
                      ? [...formData.fitness.goals, goal]
                      : formData.fitness.goals.filter(g => g !== goal);
                    updateFormData('fitness', 'goals', newGoals);
                  }}
                  className="sr-only"
                />
                <span className="flex flex-1">
                  <span className="flex flex-col">
                    <span className="block text-sm font-medium text-gray-900">{goal}</span>
                  </span>
                </span>
                <span 
                  className={`absolute -inset-px rounded-lg border-2 pointer-events-none ${
                    formData.fitness.goals.includes(goal)
                      ? 'border-blue-500'
                      : 'border-transparent'
                  }`} 
                  aria-hidden="true"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step) => (
            <li key={step.name} className="md:flex-1">
              <div
                className={`group flex flex-col border-l-4 py-2 pl-4 ${
                  step.id === step ? 'border-blue-600' : step.id < step ? 'border-blue-600' : 'border-gray-200'
                } md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4`}
              >
                <span className="text-sm font-medium text-blue-600">{step.name}</span>
                <span className="text-sm text-gray-500">{step.description}</span>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 && renderPhysicalStats()}
          {step === 2 && renderLifestyle()}
          {step === 3 && renderFitness()}

          <div className="flex justify-between space-x-4 pt-4 border-t">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!validateCurrentStep()}
                className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !validateCurrentStep()}
                className="ml-auto inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Complete Assessment'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 