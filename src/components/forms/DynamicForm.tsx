'use client';

import { useState } from 'react';
import { FormQuestion, FormSubmission } from '@/types/forms';

interface DynamicFormProps {
  questions: FormQuestion[];
  onSubmit: (answers: FormSubmission['answers']) => Promise<void>;
  initialValues?: FormSubmission['answers'];
  isSubmitting?: boolean;
}

export function DynamicForm({
  questions,
  onSubmit,
  initialValues = [],
  isSubmitting = false,
}: DynamicFormProps) {
  const [answers, setAnswers] = useState<FormSubmission['answers']>(
    initialValues.length > 0
      ? initialValues
      : questions.map((q) => ({ questionId: q.id, value: '' }))
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (questionId: string, value: any) => {
    setAnswers((prev) =>
      prev.map((answer) =>
        answer.questionId === questionId ? { ...answer, value } : answer
      )
    );
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors((prev) => ({ ...prev, [questionId]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    questions.forEach((question) => {
      const answer = answers.find((a) => a.questionId === question.id);
      const value = answer?.value;

      if (question.required && (!value || value === '')) {
        newErrors[question.id] = 'This field is required';
        isValid = false;
      }

      if (value !== undefined && value !== '') {
        switch (question.type) {
          case 'number':
            const numValue = Number(value);
            if (question.min !== undefined && numValue < question.min) {
              newErrors[question.id] = `Value must be at least ${question.min}`;
              isValid = false;
            }
            if (question.max !== undefined && numValue > question.max) {
              newErrors[question.id] = `Value must be at most ${question.max}`;
              isValid = false;
            }
            break;
          case 'rating':
            if (typeof value === 'number' && (value < 1 || value > 5)) {
              newErrors[question.id] = 'Rating must be between 1 and 5';
              isValid = false;
            }
            break;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      await onSubmit(answers);
    }
  };

  const renderQuestion = (question: FormQuestion) => {
    const answer = answers.find((a) => a.questionId === question.id);
    const value = answer?.value;
    const error = errors[question.id];

    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleChange(question.id, e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              error ? 'border-red-300' : ''
            }`}
            placeholder={question.placeholder}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => handleChange(question.id, Number(e.target.value))}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              error ? 'border-red-300' : ''
            }`}
            min={question.min}
            max={question.max}
            placeholder={question.placeholder}
          />
        );

      case 'select':
        return (
          <select
            value={value as string}
            onChange={(e) => handleChange(question.id, e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              error ? 'border-red-300' : ''
            }`}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="mt-2 space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(value as string[] || []).includes(option)}
                  onChange={(e) => {
                    const currentValue = (value as string[]) || [];
                    const newValue = e.target.checked
                      ? [...currentValue, option]
                      : currentValue.filter((v) => v !== option);
                    handleChange(question.id, newValue);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="mt-2 flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleChange(question.id, rating)}
                className={`rounded-full p-1 ${
                  value === rating
                    ? 'bg-yellow-400 text-white'
                    : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => handleChange(question.id, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-700">{question.helpText}</span>
          </label>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((question) => (
        <div key={question.id}>
          <label
            htmlFor={question.id}
            className="block text-sm font-medium text-gray-700"
          >
            {question.text}
            {question.required && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </label>
          {renderQuestion(question)}
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
          {question.helpText && !error && (
            <p className="mt-1 text-sm text-gray-500">{question.helpText}</p>
          )}
        </div>
      ))}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
} 