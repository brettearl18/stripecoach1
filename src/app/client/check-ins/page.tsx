'use client';

import { useState } from 'react';
import { CheckInForm } from '@/components/checkIn/CheckInForm';
import { useCheckIn } from '@/hooks/useCheckIn';
import type { CheckInForm as CheckInFormType } from '@/types/checkIn';

export default function CheckInsPage() {
  const { forms, loading, error, submitAnswers } = useCheckIn();
  const [selectedForm, setSelectedForm] = useState<CheckInFormType | null>(null);

  const handleSubmitAnswers = async (answers: CheckInFormType['answers']) => {
    if (!selectedForm) return;
    
    try {
      await submitAnswers(selectedForm.id, answers);
      setSelectedForm(null);
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

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
                      {new Date(form.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  {form.completedAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Completed:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(form.completedAt).toLocaleDateString()}
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