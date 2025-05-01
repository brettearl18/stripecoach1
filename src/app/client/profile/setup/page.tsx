'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { onboardingConfigService } from '@/lib/services/onboardingConfigService';
import clientProfileService from '@/lib/services/clientProfileService';
import { toast } from 'sonner';

interface FormData {
  currentWeight: string;
  targetWeight: string;
  weightUnit: 'kg' | 'lbs';
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  fitnessGoals: string[];
}

export default function ProfileSetup() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    currentWeight: '',
    targetWeight: '',
    weightUnit: 'kg',
    fitnessLevel: 'Beginner',
    fitnessGoals: [],
  });

  const handleFitnessLevelSelect = (level: FormData['fitnessLevel']) => {
    setFormData(prev => ({
      ...prev,
      fitnessLevel: level
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => {
      const goals = prev.fitnessGoals.includes(goal)
        ? prev.fitnessGoals.filter(g => g !== goal)
        : [...prev.fitnessGoals, goal];
      return {
        ...prev,
        fitnessGoals: goals
      };
    });
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      toast.error('Please sign in to continue');
      return;
    }

    try {
      setLoading(true);

      // Save onboarding responses
      await onboardingConfigService.saveResponses({
        userId: user.uid,
        configId: 'default', // You might want to get this from your active config
        responses: [
          { questionId: 'currentWeight', value: formData.currentWeight },
          { questionId: 'targetWeight', value: formData.targetWeight },
          { questionId: 'weightUnit', value: formData.weightUnit },
          { questionId: 'fitnessLevel', value: formData.fitnessLevel },
          { questionId: 'fitnessGoals', value: formData.fitnessGoals },
        ]
      });

      // Create or update client profile
      await clientProfileService.createClientProfile({
        userId: user.uid,
        currentWeight: parseFloat(formData.currentWeight),
        targetWeight: parseFloat(formData.targetWeight),
        weightUnit: formData.weightUnit,
        fitnessLevel: formData.fitnessLevel.toLowerCase(),
        goals: formData.fitnessGoals,
        programType: 'standard', // Default program type
        startDate: new Date(),
        lastCheckIn: new Date(),
        progress: {
          workouts: 0,
          nutrition: 0,
          overall: 0
        }
      });

      toast.success('Profile setup completed!');
      router.push('/client/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome to Stripe Coach</h1>
          <p className="text-gray-400 mt-1">Let's get to know you better to create your personalized fitness journey</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 border-2 border-green-500/50 rounded-lg p-6 flex flex-col items-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-white mb-2">Physical Stats</h2>
            <p className="text-sm text-gray-400 text-center">Your current and target metrics</p>
          </div>

          <div className="bg-gray-800/50 border-2 border-blue-500/50 rounded-lg p-6 flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-white mb-2">Lifestyle</h2>
            <p className="text-sm text-gray-400 text-center">Daily habits and preferences</p>
          </div>

          <div className="bg-gray-800/50 border-2 border-purple-500/50 rounded-lg p-6 flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-white mb-2">Fitness Goals</h2>
            <p className="text-sm text-gray-400 text-center">Your fitness journey objectives</p>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Weight
              </label>
              <div className="flex space-x-4">
                <input
                  type="number"
                  value={formData.currentWeight}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentWeight: e.target.value }))}
                  className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter weight"
                />
                <select
                  value={formData.weightUnit}
                  onChange={(e) => setFormData(prev => ({ ...prev, weightUnit: e.target.value as 'kg' | 'lbs' }))}
                  className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Target Weight
              </label>
              <div className="flex space-x-4">
                <input
                  type="number"
                  value={formData.targetWeight}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetWeight: e.target.value }))}
                  className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Enter target weight"
                />
                <select
                  value={formData.weightUnit}
                  disabled
                  className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2.5 text-white opacity-50"
                >
                  <option value={formData.weightUnit}>{formData.weightUnit}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Current Fitness Level
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => handleFitnessLevelSelect(level)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.fitnessLevel === level
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Fitness Goals (select all that apply)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Weight Loss',
                'Muscle Gain',
                'Endurance',
                'Flexibility',
                'Strength',
                'General Fitness'
              ].map((goal) => (
                <button
                  key={goal}
                  onClick={() => handleGoalToggle(goal)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.fitnessGoals.includes(goal)
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg font-medium transition-all duration-200 bg-gray-700 text-white hover:bg-gray-600"
          >
            Previous
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-blue-500/25 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </div>
      </div>
    </div>
  );
} 