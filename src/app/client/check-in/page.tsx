'use client';

import { useEffect, useState } from 'react';
import { DynamicForm } from '@/components/forms/DynamicForm';
import { FormTemplate, FormSubmission } from '@/types/forms';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function CheckInPage() {
  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [lastSubmission, setLastSubmission] = useState<FormSubmission | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCheckInForm();
  }, []);

  const fetchCheckInForm = async () => {
    try {
      const response = await fetch('/api/forms/check-in');
      if (!response.ok) {
        throw new Error('Failed to fetch check-in form');
      }
      const data = await response.json();
      setTemplate(data.template);
      setLastSubmission(data.lastSubmission);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (answers: FormSubmission['answers']) => {
    if (!template) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/forms/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: template.id,
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit check-in form');
      }

      const submission = await response.json();
      setLastSubmission(submission);
      // You could show a success message here
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={fetchCheckInForm}
            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">No Form Available</h2>
          <p className="mt-2 text-gray-600">
            There is no active check-in form available at this time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {template.name}
          </h1>
          <p className="mt-2 text-gray-600">{template.description}</p>
        </div>

        {lastSubmission && (
          <div className="mb-8 rounded-lg bg-gray-50 p-6">
            <h2 className="text-lg font-medium text-gray-900">
              Last Check-in Results
            </h2>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Overall Score
                </span>
                <span className="text-2xl font-bold text-indigo-600">
                  {lastSubmission.metrics.totalScore.toFixed(1)}
                </span>
              </div>
              <div className="mt-4 space-y-4">
                {lastSubmission.metrics.categoryScores.map((metric) => {
                  const category = template.categories.find(
                    (c) => c.id === metric.category
                  );
                  return (
                    <div key={metric.category}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          {category?.name}
                        </span>
                        <span className="text-lg font-semibold text-gray-900">
                          {metric.score.toFixed(1)}
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-indigo-600"
                          style={{
                            width: `${(metric.score / 5) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-white p-6 shadow">
          <DynamicForm
            questions={template.questions}
            onSubmit={handleSubmit}
            initialValues={lastSubmission?.answers}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
} 