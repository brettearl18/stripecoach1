'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { clientService } from '@/lib/services/clientService';

interface AssessmentForm {
  height: string;
  weight: string;
  age: string;
  gender: string;
  activityLevel: string;
  fitnessGoals: string[];
  medicalConditions: string;
  injuries: string;
  dietaryRestrictions: string;
  sleepHours: string;
  stressLevel: string;
  currentExercise: string;
  preferredWorkoutTime: string;
  equipment: string[];
}

const fitnessGoals = [
  'Weight Loss',
  'Muscle Gain',
  'Improve Strength',
  'Increase Endurance',
  'Better Flexibility',
  'General Fitness',
  'Sports Performance',
  'Rehabilitation',
];

const equipment = [
  'None',
  'Basic Home Equipment',
  'Full Home Gym',
  'Gym Membership',
  'Outdoor Space',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AssessmentForm>({
    height: '',
    weight: '',
    age: '',
    gender: '',
    activityLevel: '',
    fitnessGoals: [],
    medicalConditions: '',
    injuries: '',
    dietaryRestrictions: '',
    sleepHours: '',
    stressLevel: '',
    currentExercise: '',
    preferredWorkoutTime: '',
    equipment: [],
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (name: string, value: string) => {
    setFormData((prev) => {
      const currentValues = prev[name as keyof AssessmentForm] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return {
        ...prev,
        [name]: newValues,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await clientService.updateClientProfile(user?.id || '', {
        assessment: formData,
        onboardingCompleted: true,
      });

      toast.success('Assessment completed successfully!');
      router.push('/client/dashboard');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('Failed to submit assessment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Initial Assessment</h2>
          <p className="mt-2 text-gray-400">
            Help us understand your goals and current situation to create a personalized program
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-medium text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-300">
                  Height (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-300">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-300">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-300">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-medium text-white mb-4">Fitness Goals</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What are your main fitness goals? (Select all that apply)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fitnessGoals.map((goal) => (
                    <label key={goal} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.fitnessGoals.includes(goal)}
                        onChange={() => handleCheckboxChange('fitnessGoals', goal)}
                        className="h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-300">{goal}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-300">
                  Current Activity Level
                </label>
                <select
                  id="activityLevel"
                  name="activityLevel"
                  value={formData.activityLevel}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  required
                >
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary (little or no exercise)</option>
                  <option value="light">Lightly active (light exercise 1-3 days/week)</option>
                  <option value="moderate">Moderately active (moderate exercise 3-5 days/week)</option>
                  <option value="very">Very active (hard exercise 6-7 days/week)</option>
                  <option value="extra">Extra active (very hard exercise & physical job)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-medium text-white mb-4">Health & Lifestyle</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="medicalConditions" className="block text-sm font-medium text-gray-300">
                  Medical Conditions
                </label>
                <textarea
                  id="medicalConditions"
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  placeholder="List any medical conditions or concerns..."
                />
              </div>
              <div>
                <label htmlFor="injuries" className="block text-sm font-medium text-gray-300">
                  Injuries
                </label>
                <textarea
                  id="injuries"
                  name="injuries"
                  value={formData.injuries}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  placeholder="List any current or past injuries..."
                />
              </div>
              <div>
                <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-300">
                  Dietary Restrictions
                </label>
                <textarea
                  id="dietaryRestrictions"
                  name="dietaryRestrictions"
                  value={formData.dietaryRestrictions}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  placeholder="List any dietary restrictions or preferences..."
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-medium text-white mb-4">Lifestyle & Preferences</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="sleepHours" className="block text-sm font-medium text-gray-300">
                  Average Hours of Sleep
                </label>
                <input
                  type="number"
                  id="sleepHours"
                  name="sleepHours"
                  value={formData.sleepHours}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  min="0"
                  max="24"
                  step="0.5"
                />
              </div>
              <div>
                <label htmlFor="stressLevel" className="block text-sm font-medium text-gray-300">
                  Current Stress Level
                </label>
                <select
                  id="stressLevel"
                  name="stressLevel"
                  value={formData.stressLevel}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                >
                  <option value="">Select stress level</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="very-high">Very High</option>
                </select>
              </div>
              <div>
                <label htmlFor="currentExercise" className="block text-sm font-medium text-gray-300">
                  Current Exercise Routine
                </label>
                <textarea
                  id="currentExercise"
                  name="currentExercise"
                  value={formData.currentExercise}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                  placeholder="Describe your current exercise routine..."
                />
              </div>
              <div>
                <label htmlFor="preferredWorkoutTime" className="block text-sm font-medium text-gray-300">
                  Preferred Workout Time
                </label>
                <select
                  id="preferredWorkoutTime"
                  name="preferredWorkoutTime"
                  value={formData.preferredWorkoutTime}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
                >
                  <option value="">Select preferred time</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Available Equipment
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {equipment.map((item) => (
                    <label key={item} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.equipment.includes(item)}
                        onChange={() => handleCheckboxChange('equipment', item)}
                        className="h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-300">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-6 py-3 rounded-md text-white font-medium ${
                isLoading
                  ? 'bg-blue-500/50 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isLoading ? 'Submitting...' : 'Complete Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 