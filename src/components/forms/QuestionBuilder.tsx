'use client';

import { useState } from 'react';
import { Question } from '@/lib/types/forms';

interface QuestionBuilderProps {
  onSave: (questions: Question[]) => void;
  onCancel: () => void;
  initialQuestions?: Question[];
  isAIMode?: boolean;
}

export default function QuestionBuilder({
  onSave,
  onCancel,
  initialQuestions = [],
  isAIMode = false
}: QuestionBuilderProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type: 'text',
      text: '',
      required: false
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestion(newQuestion);
  };

  const handleQuestionChange = (field: keyof Question, value: any) => {
    if (!selectedQuestion) return;
    
    const updatedQuestion = { ...selectedQuestion, [field]: value };
    const updatedQuestions = questions.map(q => 
      q.id === selectedQuestion.id ? updatedQuestion : q
    );
    
    setSelectedQuestion(updatedQuestion);
    setQuestions(updatedQuestions);
  };

  return (
    <div className="bg-[#1C1C1F] min-h-[600px]">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-medium text-white">
          {isAIMode ? 'AI Question Generator' : 'Question Builder'}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Review and edit the generated questions below. Select questions to regenerate them.
        </p>
      </div>

      <div className="grid grid-cols-12 min-h-[calc(100vh-200px)]">
        {/* Question List */}
        <div className="col-span-5 border-r border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">
              {questions.length} questions added
            </span>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              + Add Question
            </button>
          </div>
          
          <div className="space-y-2">
            {questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setSelectedQuestion(question)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedQuestion?.id === question.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-[#2C2C30] text-gray-300 hover:bg-[#3C3C40]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Question {index + 1}</span>
                  {question.required && (
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-sm mt-1 truncate">
                  {question.text || 'Untitled Question'}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Question Editor */}
        <div className="col-span-7 p-6">
          {selectedQuestion ? (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question Text
                </label>
                <textarea
                  value={selectedQuestion.text}
                  onChange={(e) => handleQuestionChange('text', e.target.value)}
                  rows={2}
                  className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your question here..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Question Type
                  </label>
                  <select
                    value={selectedQuestion.type}
                    onChange={(e) => handleQuestionChange('type', e.target.value)}
                    className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="select">Single Choice</option>
                    <option value="multiselect">Multiple Choice</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="rating_scale">Rating Scale</option>
                    <option value="photo">Photo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={selectedQuestion.priority || 'Optional'}
                    onChange={(e) => handleQuestionChange('priority', e.target.value)}
                    className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Vital">Vital</option>
                    <option value="Important">Important</option>
                    <option value="Optional">Optional</option>
                  </select>
                </div>
              </div>

              {/* Options for select/multiselect */}
              {(selectedQuestion.type === 'select' || selectedQuestion.type === 'multiselect') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Options (one per line)
                  </label>
                  <textarea
                    value={selectedQuestion.options?.join('\n') || ''}
                    onChange={(e) => {
                      const options = e.target.value.split('\n').filter(Boolean);
                      handleQuestionChange('options', options);
                    }}
                    rows={4}
                    placeholder="Enter each option on a new line"
                    className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Additional settings based on question type */}
              {selectedQuestion.type === 'rating_scale' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Min Value
                    </label>
                    <input
                      type="number"
                      value={selectedQuestion.minValue || 0}
                      onChange={(e) => handleQuestionChange('minValue', parseInt(e.target.value))}
                      className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Value
                    </label>
                    <input
                      type="number"
                      value={selectedQuestion.maxValue || 5}
                      onChange={(e) => handleQuestionChange('maxValue', parseInt(e.target.value))}
                      className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {selectedQuestion.type === 'number' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={selectedQuestion.unit || ''}
                    onChange={(e) => handleQuestionChange('unit', e.target.value)}
                    placeholder="e.g., kg, lbs, minutes"
                    className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="required"
                  checked={selectedQuestion.required}
                  onChange={(e) => handleQuestionChange('required', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-700 text-indigo-600 focus:ring-indigo-500 bg-[#2C2C30]"
                />
                <label htmlFor="required" className="ml-2 text-sm text-gray-300">
                  This question is required
                </label>
              </div>

              {isAIMode && (
                <button
                  type="button"
                  className="mt-4 w-full py-2 px-4 border border-gray-700 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  Regenerate This Question
                </button>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <p>Select a question to edit or add a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 p-4 flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <div className="space-x-3">
          {isAIMode && (
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Regenerate All
            </button>
          )}
          <button
            type="button"
            onClick={() => onSave(questions)}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Save Questions
          </button>
        </div>
      </div>
    </div>
  );
} 