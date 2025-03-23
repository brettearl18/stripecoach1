'use client';

import { useState } from 'react';
import { FormQuestion } from '@/types/forms';

interface DynamicFormProps {
  questions: FormQuestion[];
  onSubmit: (answers: Record<string, any>) => Promise<void>;
  initialValues?: Record<string, any>;
  isSubmitting?: boolean;
}

export function DynamicForm({
  questions,
  onSubmit,
  initialValues = {},
  isSubmitting = false,
}: DynamicFormProps) {
  const [answers, setAnswers] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    questions.forEach((question) => {
      const value = answers[question.id];

      if (question.required && (value === undefined || value === '' || (Array.isArray(value) && value.length === 0))) {
        newErrors[question.id] = 'This field is required';
        isValid = false;
      }

      if (value !== undefined && value !== '') {
        if (question.type === 'number') {
          const numValue = Number(value);
          if (question.min !== undefined && numValue < question.min) {
            newErrors[question.id] = `Value must be at least ${question.min}`;
            isValid = false;
          }
          if (question.max !== undefined && numValue > question.max) {
            newErrors[question.id] = `Value must be at most ${question.max}`;
            isValid = false;
          }
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
    const value = answers[question.id];
    const error = errors[question.id];

    const baseInputClasses = `mt-1 block w-full rounded-lg border bg-[#2A303A] border-gray-700 text-gray-100 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 ${
      error ? 'border-red-500' : ''
    }`;

    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(question.id, e.target.value)}
            className={baseInputClasses}
            placeholder={question.placeholder}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(question.id, Number(e.target.value))}
            className={baseInputClasses}
            min={question.min}
            max={question.max}
            placeholder={question.placeholder}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleChange(question.id, e.target.value)}
            className={baseInputClasses}
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
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValue = value || [];
                    const newValue = e.target.checked
                      ? [...currentValue, option]
                      : currentValue.filter((v: string) => v !== option);
                    handleChange(question.id, newValue);
                  }}
                  className="h-4 w-4 rounded border-gray-600 bg-[#2A303A] text-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-300">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'rating':
        return (
          <div className="mt-2 flex items-center space-x-3">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleChange(question.id, rating)}
                className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                  value === rating
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#2A303A] text-gray-400 hover:bg-[#353B47] border border-gray-700'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(question.id, e.target.checked)}
              className="h-4 w-4 rounded border-gray-600 bg-[#2A303A] text-indigo-500 focus:ring-indigo-500 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-300">{question.helpText}</span>
          </label>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {questions.map((question) => (
        <div key={question.id} className="space-y-2 bg-[#1A1F26] p-4 rounded-lg border border-gray-800/50">
          <label className="block text-sm font-medium text-gray-200">
            {question.text}
            {question.required && <span className="ml-1 text-red-400">*</span>}
          </label>
          {renderQuestion(question)}
          {errors[question.id] && (
            <p className="mt-1 text-sm text-red-400">{errors[question.id]}</p>
          )}
          {question.helpText && !errors[question.id] && (
            <p className="mt-1 text-sm text-gray-400">{question.helpText}</p>
          )}
        </div>
      ))}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1F26] focus:ring-indigo-500 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Check-in'}
        </button>
      </div>
    </form>
  );
} 