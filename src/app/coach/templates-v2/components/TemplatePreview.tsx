import { useState } from 'react';
import { motion } from 'framer-motion';

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

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'text':
        return (
          <textarea
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            rows={3}
            className="w-full bg-[#1C1C1F] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your answer..."
          />
        );

      case 'yesNo':
        return (
          <div className="flex space-x-4">
            <button
              onClick={() => handleAnswer(question.id, true)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                answers[question.id] === true
                  ? 'bg-green-600 text-white'
                  : 'bg-[#1C1C1F] text-gray-400 hover:text-white'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleAnswer(question.id, false)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                answers[question.id] === false
                  ? 'bg-red-600 text-white'
                  : 'bg-[#1C1C1F] text-gray-400 hover:text-white'
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
                className="flex items-center space-x-3 p-3 bg-[#1C1C1F] rounded-lg hover:bg-[#2C2C30] transition-colors cursor-pointer"
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
                  className="h-4 w-4 rounded border-gray-700 text-indigo-600 focus:ring-indigo-500 bg-[#2C2C30]"
                />
                <span className="text-white">{option}</span>
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
                className="flex items-center space-x-3 p-3 bg-[#1C1C1F] rounded-lg hover:bg-[#2C2C30] transition-colors cursor-pointer"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="h-4 w-4 border-gray-700 text-indigo-600 focus:ring-indigo-500 bg-[#2C2C30]"
                />
                <span className="text-white">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'scale':
        const min = question.validation?.min || 1;
        const max = question.validation?.max || 10;
        return (
          <div className="space-y-4">
            <div className="flex justify-between px-2">
              {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((value) => (
                <button
                  key={value}
                  onClick={() => handleAnswer(question.id, value)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    answers[question.id] === value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-[#1C1C1F] text-gray-400 hover:text-white'
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

      {/* Section Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {template.sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => setCurrentSection(index)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              currentSection === index
                ? 'bg-indigo-600 text-white'
                : 'bg-[#1C1C1F] text-gray-400 hover:text-white'
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      {/* Current Section */}
      {template.sections[currentSection] && (
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
            {template.sections[currentSection].questions.map((question) => (
              <div key={question.id} className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{question.text}</h4>
                    {question.required && (
                      <span className="text-xs text-red-500 mt-1">* Required</span>
                    )}
                  </div>
                </div>
                {renderQuestion(question)}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <button
          onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
          disabled={currentSection === 0}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentSection === 0
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-[#1C1C1F] text-gray-400 hover:text-white'
          }`}
        >
          Previous Section
        </button>
        <button
          onClick={() => setCurrentSection(prev => Math.min(template.sections.length - 1, prev + 1))}
          disabled={currentSection === template.sections.length - 1}
          className={`px-4 py-2 rounded-lg transition-colors ${
            currentSection === template.sections.length - 1
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          Next Section
        </button>
      </div>
    </div>
  );
} 