'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Assessment, saveAssessment } from '@/lib/services/assessmentService';

const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'];
const commonGoals = [
  'Weight Loss',
  'Muscle Gain',
  'Improve Strength',
  'Better Endurance',
  'Overall Health',
  'Athletic Performance'
];
const dietaryRestrictions = [
  'None',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Other'
];

export default function InitialAssessment() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Assessment>>({
    physicalStats: {
      weight: 0,
      weightUnit: 'kg',
      targetWeight: 0
    },
    lifestyle: {
      sleepQuality: 3,
      energyLevel: 3,
      stressLevel: 3,
      dietaryRestrictions: []
    },
    fitness: {
      currentLevel: 'Beginner',
      injuries: '',
      goals: []
    }
  });

  const handleInputChange = (section: keyof Assessment, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleMultiSelect = (section: keyof Assessment, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section]?.[field]?.includes(value)
          ? prev[section][field].filter((item: string) => item !== value)
          : [...(prev[section]?.[field] || []), value]
      }
    }));
  };

  const handleSubmit = async () => {
    if (!user?.uid) return;
    
    setIsSubmitting(true);
    try {
      await saveAssessment({
        userId: user.uid,
        ...formData as Assessment,
        completedAt: new Date()
      });
      router.push('/client/dashboard');
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('Failed to save assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Physical Stats</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Weight</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.physicalStats?.weight || ''}
                    onChange={(e) => handleInputChange('physicalStats', 'weight', parseFloat(e.target.value))}
                    className="flex-1 rounded-md border p-2"
                    min="0"
                  />
                  <select
                    value={formData.physicalStats?.weightUnit}
                    onChange={(e) => handleInputChange('physicalStats', 'weightUnit', e.target.value)}
                    className="rounded-md border p-2"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Weight</label>
                <input
                  type="number"
                  value={formData.physicalStats?.targetWeight || ''}
                  onChange={(e) => handleInputChange('physicalStats', 'targetWeight', parseFloat(e.target.value))}
                  className="w-full rounded-md border p-2"
                  min="0"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Lifestyle & Wellness</h2>
            <div className="space-y-4">
              {['Sleep Quality', 'Energy Level', 'Stress Level'].map((item) => (
                <div key={item}>
                  <label className="block text-sm font-medium mb-1">{item}</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.lifestyle?.[item.toLowerCase().replace(' ', '') as keyof typeof formData.lifestyle] || 3}
                    onChange={(e) => handleInputChange('lifestyle', item.toLowerCase().replace(' ', ''), parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Poor</span>
                    <span>Excellent</span>
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1">Dietary Restrictions</label>
                <div className="grid grid-cols-2 gap-2">
                  {dietaryRestrictions.map((restriction) => (
                    <label key={restriction} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.lifestyle?.dietaryRestrictions?.includes(restriction)}
                        onChange={() => handleMultiSelect('lifestyle', 'dietaryRestrictions', restriction)}
                        className="rounded"
                      />
                      <span>{restriction}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Fitness & Goals</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Fitness Level</label>
                <select
                  value={formData.fitness?.currentLevel}
                  onChange={(e) => handleInputChange('fitness', 'currentLevel', e.target.value)}
                  className="w-full rounded-md border p-2"
                >
                  {fitnessLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Any Injuries or Medical Conditions?</label>
                <textarea
                  value={formData.fitness?.injuries}
                  onChange={(e) => handleInputChange('fitness', 'injuries', e.target.value)}
                  className="w-full rounded-md border p-2"
                  rows={3}
                  placeholder="Please describe any injuries or medical conditions we should know about..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fitness Goals</label>
                <div className="grid grid-cols-2 gap-2">
                  {commonGoals.map((goal) => (
                    <label key={goal} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.fitness?.goals?.includes(goal)}
                        onChange={() => handleMultiSelect('fitness', 'goals', goal)}
                        className="rounded"
                      />
                      <span>{goal}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`w-1/3 h-2 rounded-full ${
                stepNumber <= step ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-sm text-gray-500">
          Step {step} of 3
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        {renderStep()}

        <div className="flex justify-between pt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="ml-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="ml-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Complete'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
} 