import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRightIcon, ChevronLeftIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

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

interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface TemplatePreviewProps {
  template: {
    name: string;
    description: string;
    category: string;
    tags: string[];
    sections: Section[];
  };
}

export default function TemplatePreview({ template }: TemplatePreviewProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showQuickNav, setShowQuickNav] = useState(false);

  // Calculate progress
  const totalQuestions = template.sections.reduce((acc, section) => acc + section.questions.length, 0);
  const answeredQuestions = Object.keys(answers).length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  // Load saved progress
  useEffect(() => {
    const savedAnswers = localStorage.getItem(`template_progress_${template.name}`);
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, [template.name]);

  // Save progress
  useEffect(() => {
    localStorage.setItem(`template_progress_${template.name}`, JSON.stringify(answers));
  }, [answers, template.name]);

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const getQuestionNumber = (sectionIndex: number, questionIndex: number): string => {
    let number = 1;
    for (let i = 0; i < sectionIndex; i++) {
      number += template.sections[i].questions.length;
    }
    return `${number + questionIndex}`;
  };

  const renderQuestion = (question: Question, sectionIndex: number, questionIndex: number) => {
    const questionNumber = getQuestionNumber(sectionIndex, questionIndex);
    
    return (
      <div key={question.id} className="space-y-4 bg-[#1C1C1F] p-6 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-indigo-400 font-medium">Q{questionNumber}.</span>
              <h4 className="text-white font-medium">{question.text}</h4>
              {question.required && (
                <span className="text-red-500 text-sm">*Required</span>
              )}
            </div>
            {answers[question.id] && (
              <span className="text-green-500 text-sm flex items-center gap-1 mt-1">
                <CheckCircleIcon className="w-4 h-4" />
                Answered
              </span>
            )}
          </div>
        </div>
        
        {renderQuestionInput(question)}
      </div>
    );
  };

  const renderQuestionInput = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            rows={3}
            className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your answer..."
          />
        );

      case 'yesNo':
        return (
          <div className="flex space-x-4">
            <button
              onClick={() => handleAnswer(question.id, true)}
              className={`px-6 py-3 rounded-lg transition-colors ${
                answers[question.id] === true
                  ? 'bg-green-600 text-white'
                  : 'bg-[#2C2C30] text-gray-400 hover:text-white'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswer(question.id, false)}
              className={`px-6 py-3 rounded-lg transition-colors ${
                answers[question.id] === false
                  ? 'bg-red-600 text-white'
                  : 'bg-[#2C2C30] text-gray-400 hover:text-white'
              }`}
            >
              No
            </button>
          </div>
        );

      case 'multipleChoice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-3 p-4 bg-[#2C2C30] rounded-lg hover:bg-[#3C3C40] transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={answers[question.id]?.includes(option)}
                  onChange={(e) => {
                    const currentAnswers = answers[question.id] || [];
                    const newAnswers = e.target.checked
                      ? [...currentAnswers, option]
                      : currentAnswers.filter((a: string) => a !== option);
                    handleAnswer(question.id, newAnswers);
                  }}
                  className="h-5 w-5 rounded border-gray-700 text-indigo-600 focus:ring-indigo-500 bg-[#2C2C30]"
                />
                <span className="text-white text-lg">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center space-x-3 p-4 bg-[#2C2C30] rounded-lg hover:bg-[#3C3C40] transition-colors cursor-pointer"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="h-5 w-5 border-gray-700 text-indigo-600 focus:ring-indigo-500 bg-[#2C2C30]"
                />
                <span className="text-white text-lg">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'scale':
        const min = question.validation?.min || 1;
        const max = question.validation?.max || 10;
        return (
          <div className="space-y-6">
            <div className="flex justify-between px-2">
              {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(question.id, value)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-medium transition-colors ${
                    answers[question.id] === value
                      ? 'bg-indigo-600 text-white'
                      : value <= (answers[question.id] || 0)
                      ? 'bg-indigo-500/50 text-white'
                      : 'bg-[#2C2C30] text-gray-400 hover:text-white'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex justify-between px-2 text-sm text-gray-400">
              <span>Not at all</span>
              <span>Very much</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderReviewMode = () => (
    <div className="space-y-8">
      {template.sections.map((section, sectionIndex) => (
        <div key={section.id} className="space-y-4">
          <h3 className="text-xl font-medium text-white">{section.title}</h3>
          {section.questions.map((question, questionIndex) => (
            <div key={question.id} className="bg-[#1C1C1F] p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white">
                    <span className="text-indigo-400">Q{getQuestionNumber(sectionIndex, questionIndex)}.</span>
                    {' '}{question.text}
                  </p>
                  <div className="mt-2">
                    {answers[question.id] ? (
                      <div className="text-green-500 flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>
                          {Array.isArray(answers[question.id])
                            ? answers[question.id].join(', ')
                            : answers[question.id].toString()}
                        </span>
                      </div>
                    ) : (
                      <div className="text-red-500 flex items-center gap-2">
                        <ExclamationCircleIcon className="w-5 h-5" />
                        <span>Not answered</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCurrentSection(sectionIndex);
                    setIsReviewMode(false);
                  }}
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-white mb-2">{template.name}</h2>
        <p className="text-gray-400">{template.description}</p>
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {template.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="text-white">{Math.round(progress)}% Complete</span>
        </div>
        <div className="h-2 bg-[#2C2C30] rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-sm text-gray-400">
          {answeredQuestions} of {totalQuestions} questions answered
        </div>
      </div>

      {/* Quick Navigation Toggle */}
      <button
        onClick={() => setShowQuickNav(!showQuickNav)}
        className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-2"
      >
        {showQuickNav ? 'Hide' : 'Show'} Question Navigator
        <ChevronRightIcon className={`w-4 h-4 transform transition-transform ${showQuickNav ? 'rotate-90' : ''}`} />
      </button>

      {/* Quick Navigation */}
      {showQuickNav && (
        <div className="grid grid-cols-8 gap-2">
          {template.sections.map((section, sectionIndex) =>
            section.questions.map((question, questionIndex) => {
              const questionNumber = getQuestionNumber(sectionIndex, questionIndex);
              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentSection(sectionIndex)}
                  className={`p-2 rounded-lg text-center ${
                    answers[question.id]
                      ? 'bg-green-600/20 text-green-400'
                      : question.required
                      ? 'bg-red-600/20 text-red-400'
                      : 'bg-[#2C2C30] text-gray-400'
                  }`}
                  title={question.text}
                >
                  {questionNumber}
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Content */}
      {isReviewMode ? (
        renderReviewMode()
      ) : (
        <motion.div
          key={template.sections[currentSection].id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          <div>
            <h3 className="text-xl font-medium text-white">
              {template.sections[currentSection].title}
            </h3>
            {template.sections[currentSection].description && (
              <p className="mt-2 text-gray-400">
                {template.sections[currentSection].description}
              </p>
            )}
          </div>

          <div className="space-y-6">
            {template.sections[currentSection].questions.map((question, index) =>
              renderQuestion(question, currentSection, index)
            )}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={() => {
            if (isReviewMode) {
              setIsReviewMode(false);
            } else {
              setCurrentSection(prev => Math.max(0, prev - 1));
            }
          }}
          disabled={!isReviewMode && currentSection === 0}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            !isReviewMode && currentSection === 0
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-[#2C2C30] text-gray-400 hover:text-white'
          }`}
        >
          <ChevronLeftIcon className="w-5 h-5" />
          {isReviewMode ? 'Back to Questions' : 'Previous Section'}
        </button>
        
        <div className="flex gap-2">
          {isReviewMode && (
            <button
              onClick={() => onSave(answers)}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              Continue to Settings
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          )}
          {!isReviewMode && (
            <button
              onClick={() => {
                if (currentSection === template.sections.length - 1) {
                  setIsReviewMode(true);
                } else {
                  setCurrentSection(prev => Math.min(template.sections.length - 1, prev + 1));
                }
              }}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              {currentSection === template.sections.length - 1 ? 'Review Answers' : 'Next Section'}
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 