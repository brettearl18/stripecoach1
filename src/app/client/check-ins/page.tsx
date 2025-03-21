'use client';

import { useState } from 'react';
import { CheckInForm } from '@/components/checkIn/CheckInForm';
import type { CheckInForm as CheckInFormType } from '@/types/checkIn';

// Utility function for consistent date formatting
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
  } catch (error) {
    return dateString;
  }
};

// Mock data for development
const mockForms: CheckInFormType[] = [
  {
    id: 'daily-checkin-1',
    title: 'Quick Daily Check-in',
    description: 'A brief daily check-in to track essential metrics and habits',
    questions: [
      {
        id: 'daily-water',
        type: 'number',
        text: 'How many liters of water did you drink today?',
        required: true,
      },
      {
        id: 'daily-meals',
        type: 'number',
        text: 'How many meals did you eat today?',
        required: true,
      },
      {
        id: 'daily-energy',
        type: 'rating_scale',
        text: 'How would you rate your energy levels today?',
        required: true,
      },
      {
        id: 'daily-sleep-hours',
        type: 'number',
        text: 'How many hours of sleep did you get last night?',
        required: true,
      },
      {
        id: 'daily-sleep-quality',
        type: 'rating_scale',
        text: 'Rate your sleep quality',
        required: true,
      }
    ],
    status: 'pending',
    dueDate: new Date().toISOString(),
    answers: [],
    clientId: 'test-client',
    templateId: 'quick-daily-checkin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export default function CheckInsPage() {
  const [selectedForm, setSelectedForm] = useState<CheckInFormType | null>(null);
  const [forms] = useState<CheckInFormType[]>(mockForms);

  const handleSubmitAnswers = async (answers: CheckInFormType['answers']) => {
    if (!selectedForm) return;
    
    try {
      console.log('Submitted answers:', answers);
      setSelectedForm(null);
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Check-ins
        </h1>

        {selectedForm ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedForm.title}
              </h2>
              <button
                onClick={() => setSelectedForm(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <CheckInForm
              form={selectedForm}
              onSubmit={handleSubmitAnswers}
            />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
                onClick={() => setSelectedForm(form)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {form.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      form.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}
                  >
                    {form.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {form.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Due Date:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(form.dueDate)}
                    </span>
                  </div>
                  {form.completedAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Completed:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatDate(form.completedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 