'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { clientService } from '@/lib/services/clientService';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon,
  ClipboardDocumentListIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ClientSetupPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [setupData, setSetupData] = useState({
    checkInFrequency: 'weekly',
    checkInDay: 'monday',
    programType: 'general',
    initialGoals: [] as string[],
    notes: ''
  });

  useEffect(() => {
    loadClient();
  }, [params.id]);

  const loadClient = async () => {
    try {
      setIsLoading(true);
      const profile = await clientService.getClientProfile(params.id as string);
      if (!profile) {
        throw new Error('Client profile not found');
      }
      setClient(profile);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load client profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      await clientService.updateClientProfile(params.id as string, {
        program: {
          type: setupData.programType,
          currentWeek: 1,
          totalWeeks: 12,
          phase: 'Getting Started'
        },
        goals: setupData.initialGoals,
        notes: setupData.notes,
        checkInSchedule: {
          frequency: setupData.checkInFrequency,
          day: setupData.checkInDay
        }
      });

      toast.success('Client setup completed!');
      router.push(`/coach/clients/${params.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to complete client setup');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      title: 'Program Type',
      icon: ClipboardDocumentListIcon,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Select Program Type</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['General Fitness', 'Weight Loss', 'Muscle Building', 'Strength Training', 'Sports Performance', 'Wellness'].map((type) => (
              <button
                key={type}
                onClick={() => setSetupData(prev => ({ ...prev, programType: type.toLowerCase() }))}
                className={`p-4 rounded-lg border ${
                  setupData.programType === type.toLowerCase()
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                } text-left`}
              >
                <span className="text-white font-medium">{type}</span>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Check-in Schedule',
      icon: CalendarIcon,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Set Check-in Schedule</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Frequency</label>
              <select
                value={setupData.checkInFrequency}
                onChange={(e) => setSetupData(prev => ({ ...prev, checkInFrequency: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white py-2 px-3"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Preferred Day</label>
              <select
                value={setupData.checkInDay}
                onChange={(e) => setSetupData(prev => ({ ...prev, checkInDay: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white py-2 px-3"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <option key={day} value={day.toLowerCase()}>{day}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Initial Goals',
      icon: ChartBarIcon,
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-white">Set Initial Goals</h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                'Weight Loss',
                'Muscle Gain',
                'Strength',
                'Endurance',
                'Flexibility',
                'Better Sleep',
                'Stress Management',
                'Nutrition',
                'Recovery',
                'Sports Performance'
              ].map((goal) => (
                <button
                  key={goal}
                  onClick={() => {
                    setSetupData(prev => ({
                      ...prev,
                      initialGoals: prev.initialGoals.includes(goal)
                        ? prev.initialGoals.filter(g => g !== goal)
                        : [...prev.initialGoals, goal]
                    }));
                  }}
                  className={`px-4 py-2 rounded-full ${
                    setupData.initialGoals.includes(goal)
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
            <textarea
              value={setupData.notes}
              onChange={(e) => setSetupData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about client goals..."
              className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white py-2 px-3 h-32"
            />
          </div>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#141517] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141517] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/coach/clients/${params.id}`}
            className="inline-flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Client
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Set Up {client?.firstName}'s Profile</h1>
          <p className="text-gray-400 mt-2">Configure your client's program and check-in schedule</p>
        </div>

        <div className="bg-gray-800 rounded-xl overflow-hidden">
          {/* Progress Steps */}
          <div className="border-b border-gray-700">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className={`flex items-center ${
                      index < currentStep ? 'text-indigo-400' : 
                      index === currentStep - 1 ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index < currentStep ? 'bg-indigo-500' :
                        index === currentStep - 1 ? 'bg-gray-700' : 'bg-gray-800 border border-gray-700'
                      }`}>
                        {index < currentStep ? (
                          <CheckCircleIcon className="w-5 h-5" />
                        ) : (
                          <step.icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className="ml-2 text-sm font-medium">{step.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden sm:block w-full bg-gray-700 h-0.5 mx-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6">
            {steps[currentStep - 1].content}
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-900/50 border-t border-gray-700">
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                disabled={currentStep === 1}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  if (currentStep === steps.length) {
                    handleSubmit();
                  } else {
                    setCurrentStep(prev => Math.min(prev + 1, steps.length));
                  }
                }}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === steps.length ? 'Complete Setup' : 'Next Step'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 