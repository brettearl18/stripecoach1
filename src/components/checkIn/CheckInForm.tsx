import { useState } from 'react';
import type { CheckInForm, CheckInAnswer, Question } from '@/types/checkIn';

interface CheckInFormProps {
  form: CheckInForm;
  onSubmit: (answers: CheckInAnswer[]) => Promise<void>;
}

export function CheckInForm({ form, onSubmit }: CheckInFormProps) {
  const [answers, setAnswers] = useState<CheckInAnswer[]>(form.answers);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateAnswer = (questionId: string, value: string | number | boolean | string[]) => {
    setAnswers(prev => {
      const existingAnswer = prev.find(a => a.questionId === questionId);
      if (existingAnswer) {
        return prev.map(a => 
          a.questionId === questionId 
            ? { ...a, value, updatedAt: new Date().toISOString() }
            : a
        );
      }
      return [...prev, {
        questionId,
        value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(answers);
    } catch (error) {
      console.error('Error submitting check-in:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionInput = (question: Question) => {
    const answer = answers.find(a => a.questionId === question.id);
    const value = answer?.value || '';

    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            required={question.required}
            placeholder={question.placeholder}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => updateAnswer(question.id, Number(e.target.value))}
            required={question.required}
            min={question.min}
            max={question.max}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm"
          />
        );

      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => updateAnswer(question.id, e.target.value)}
            required={question.required}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm"
          >
            <option value="">Select an option</option>
            {question.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {question.options?.map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(value as string[] || []).includes(option)}
                  onChange={(e) => {
                    const currentValue = value as string[] || [];
                    const newValue = e.target.checked
                      ? [...currentValue, option]
                      : currentValue.filter(v => v !== option);
                    updateAnswer(question.id, newValue);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={(e) => updateAnswer(question.id, e.target.checked)}
            required={question.required}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-700"
          />
        );

      case 'rating':
        return (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => updateAnswer(question.id, rating)}
                className={`p-2 rounded-full ${
                  (value as number) === rating
                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Check-in Form
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Due: {new Date(form.dueDate).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6">
        {form.questions.map((question) => (
          <div key={question.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="mt-2">
              {renderQuestionInput(question)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Check-in'}
        </button>
      </div>
    </form>
  );
} 