import { useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'yesNo' | 'multipleChoice' | 'scale' | 'radio';
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
  };
}

interface TemplatePreviewProps {
  sections: Section[];
  onSave: () => void;
}

export default function TemplatePreview({ sections, onSave }: TemplatePreviewProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Calculate progress
  const totalQuestions = sections.reduce((acc, section) => acc + section.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      setIsReviewMode(true);
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-3 text-white"
            rows={4}
            placeholder="Enter your response..."
          />
        );
      case 'yesNo':
        return (
          <div className="flex gap-4">
            <button
              onClick={() => handleAnswer(question.id, true)}
              className={`px-6 py-2 rounded-lg ${
                answers[question.id] === true
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#2C2C30] text-gray-400 hover:text-white'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswer(question.id, false)}
              className={`px-6 py-2 rounded-lg ${
                answers[question.id] === false
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#2C2C30] text-gray-400 hover:text-white'
              }`}
            >
              No
            </button>
          </div>
        );
      case 'scale':
        return (
          <div className="flex gap-2">
            {Array.from({ length: (question.validation?.max || 10) - (question.validation?.min || 1) + 1 }).map((_, i) => {
              const value = (question.validation?.min || 1) + i;
              return (
                <button
                  key={value}
                  onClick={() => handleAnswer(question.id, value)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    answers[question.id] === value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#2C2C30] text-gray-400 hover:text-white'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        );
      case 'multipleChoice':
      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <button
                key={option}
                onClick={() => {
                  if (question.type === 'multipleChoice') {
                    const currentValue = answers[question.id] || [];
                    const newValue = currentValue.includes(option)
                      ? currentValue.filter((v: string) => v !== option)
                      : [...currentValue, option];
                    handleAnswer(question.id, newValue);
                  } else {
                    handleAnswer(question.id, option);
                  }
                }}
                className={`w-full px-4 py-2 rounded-lg text-left ${
                  question.type === 'multipleChoice'
                    ? (answers[question.id] || []).includes(option)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#2C2C30] text-gray-400 hover:text-white'
                    : answers[question.id] === option
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#2C2C30] text-gray-400 hover:text-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (isReviewMode) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-2">Review Your Responses</h2>
          <p className="text-gray-400">
            Review your responses before submitting.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.id} className="bg-[#1C1C1F] rounded-lg p-6">
              <h3 className="text-xl font-medium text-white mb-4">{section.title}</h3>
              {section.description && (
                <p className="text-gray-400 mb-6">{section.description}</p>
              )}
              <div className="space-y-6">
                {section.questions.map((question) => (
                  <div key={question.id} className="space-y-2">
                    <div className="text-white font-medium">{question.text}</div>
                    <div className="text-indigo-400">
                      {question.type === 'yesNo'
                        ? answers[question.id] ? 'Yes' : 'No'
                        : question.type === 'multipleChoice'
                        ? (answers[question.id] || []).join(', ')
                        : answers[question.id]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setIsReviewMode(false)}
            className="px-6 py-2.5 text-gray-400 hover:text-white"
          >
            Back to Questions
          </button>
          <button
            onClick={onSave}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            Continue to Settings
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const currentSectionData = sections[currentSection];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">Preview Template</h2>
        <p className="text-gray-400">
          Preview how your template will appear to clients.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#1C1C1F] rounded-lg p-4">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {currentSectionData && (
        <div className="bg-[#1C1C1F] rounded-lg p-6">
          <h3 className="text-xl font-medium text-white mb-4">{currentSectionData.title}</h3>
          {currentSectionData.description && (
            <p className="text-gray-400 mb-6">{currentSectionData.description}</p>
          )}
          <div className="space-y-8">
            {currentSectionData.questions.map((question) => (
              <div key={question.id} className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="text-white font-medium">{question.text}</div>
                    {question.required && (
                      <div className="text-sm text-red-500">* Required</div>
                    )}
                  </div>
                </div>
                {renderQuestion(question)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={handleBack}
          className={`px-6 py-2.5 ${
            currentSection > 0
              ? 'text-gray-400 hover:text-white'
              : 'text-gray-700 cursor-not-allowed'
          }`}
          disabled={currentSection === 0}
        >
          Previous Section
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {currentSection < sections.length - 1 ? 'Next Section' : 'Review Answers'}
        </button>
      </div>
    </div>
  );
} 