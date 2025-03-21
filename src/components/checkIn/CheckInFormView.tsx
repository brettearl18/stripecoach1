'use client';

import { useState } from 'react';
import type { CheckInForm } from '@/lib/services/firebaseService';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface CheckInFormViewProps {
  form: CheckInForm;
  onSubmit: (answers: Record<number, any>) => void;
  isLoading?: boolean;
}

export default function CheckInFormView({ form, onSubmit, isLoading = false }: CheckInFormViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [progress, setProgress] = useState(0);

  const handleAnswer = (questionId: number, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // Calculate progress
    const totalRequired = form.questions.filter(q => q.required).length;
    const answeredRequired = form.questions.filter(q => q.required && answers[q.id] !== undefined).length;
    setProgress((answeredRequired / totalRequired) * 100);
  };

  const handleNext = () => {
    if (currentStep < form.questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  const currentQuestion = form.questions[currentStep];
  const isLastQuestion = currentStep === form.questions.length - 1;
  const canSubmit = form.questions.every(q => !q.required || answers[q.id] !== undefined);

  return (
    <div className="min-h-screen bg-[#0B0F15] text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{form.title}</h1>
          <p className="text-gray-400">{form.description}</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-400">
            Progress: {Math.round(progress)}%
          </div>
        </div>

        {/* Question */}
        <div
          key={currentQuestion.id}
          className="bg-[#1A1F2B] rounded-lg p-6 mb-6 transition-all duration-300"
        >
          <h2 className="text-xl mb-4">
            {currentQuestion.text}
            {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
          </h2>

          {/* Question input based on type */}
          {currentQuestion.type === 'scale' && (
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                <button
                  key={value}
                  onClick={() => handleAnswer(currentQuestion.id, value)}
                  className={`w-10 h-10 rounded-full ${
                    answers[currentQuestion.id] === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'text' && (
            <textarea
              value={answers[currentQuestion.id] || ''}
              onChange={e => handleAnswer(currentQuestion.id, e.target.value)}
              className="w-full bg-[#2A303C] rounded-lg p-3 text-white"
              rows={4}
              placeholder="Enter your answer..."
            />
          )}

          {currentQuestion.type === 'number' && (
            <input
              type="number"
              value={answers[currentQuestion.id] || ''}
              onChange={e => handleAnswer(currentQuestion.id, parseInt(e.target.value))}
              className="w-full bg-[#2A303C] rounded-lg p-3 text-white"
              placeholder="Enter a number..."
            />
          )}

          {currentQuestion.type === 'multiple_choice' && (
            <div className="space-y-3">
              {currentQuestion.options?.map(option => (
                <button
                  key={option}
                  onClick={() => handleAnswer(currentQuestion.id, option)}
                  className={`w-full text-left p-3 rounded-lg ${
                    answers[currentQuestion.id] === option
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQuestion.type === 'yes_no' && (
            <div className="flex gap-4">
              <button
                onClick={() => handleAnswer(currentQuestion.id, true)}
                className={`flex-1 p-3 rounded-lg ${
                  answers[currentQuestion.id] === true
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => handleAnswer(currentQuestion.id, false)}
                className={`flex-1 p-3 rounded-lg ${
                  answers[currentQuestion.id] === false
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                No
              </button>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0 || isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              currentStep === 0
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            } transition-colors`}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                canSubmit && !isLoading
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
              } transition-colors`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id] && currentQuestion.required}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                !answers[currentQuestion.id] && currentQuestion.required
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } transition-colors`}
            >
              Next
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 