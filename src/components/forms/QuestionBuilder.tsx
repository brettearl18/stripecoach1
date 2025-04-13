'use client';

import { useState } from 'react';
import { Question } from '@/lib/types/forms';
import { TrashIcon } from '@heroicons/react/24/outline';

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
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    initialQuestions.length > 0 ? initialQuestions[0] : null
  );

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: '',
      type: 'yesNo',
      required: false,
      weight: 1,
      category: '',
      options: []
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
    <div className="bg-[#1C1C1F] min-h-[600px] max-w-6xl mx-auto rounded-lg shadow-xl">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-medium text-white">
          {isAIMode ? 'AI Question Generator' : 'Question Builder'}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {isAIMode ? 'Review and edit the generated questions below.' : 'Create and edit your questions below.'}
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
                    onChange={(e) => {
                      const type = e.target.value as QuestionType;
                      handleQuestionChange('type', type);
                      // Reset options when changing type
                      if (type === 'multipleChoice' || type === 'radio') {
                        handleQuestionChange('options', []);
                      }
                    }}
                    className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {QUESTION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedQuestion.category}
                    onChange={(e) => handleQuestionChange('category', e.target.value)}
                    className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select a category</option>
                    {QUESTION_CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Options for multiple choice or radio questions */}
              {(selectedQuestion.type === 'multipleChoice' || selectedQuestion.type === 'radio') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Options
                  </label>
                  <div className="space-y-2">
                    {selectedQuestion.options?.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const options = [...(selectedQuestion.options || [])];
                            options[index] = e.target.value;
                            handleQuestionChange('options', options);
                          }}
                          className="flex-1 bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          onClick={() => {
                            const options = selectedQuestion.options?.filter((_, i) => i !== index) || [];
                            handleQuestionChange('options', options);
                          }}
                          className="p-2 text-red-400 hover:text-red-300"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const options = [...(selectedQuestion.options || []), ''];
                        handleQuestionChange('options', options);
                      }}
                      className="text-sm text-indigo-400 hover:text-indigo-300"
                    >
                      + Add Option
                    </button>
                  </div>
                </div>
              )}

              {/* Scale settings for scale questions */}
              {selectedQuestion.type === 'scale' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minimum Value
                    </label>
                    <input
                      type="number"
                      value={selectedQuestion.validation?.min || 1}
                      onChange={(e) => {
                        handleQuestionChange('validation', {
                          ...selectedQuestion.validation,
                          min: parseInt(e.target.value)
                        });
                      }}
                      className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Maximum Value
                    </label>
                    <input
                      type="number"
                      value={selectedQuestion.validation?.max || 10}
                      onChange={(e) => {
                        handleQuestionChange('validation', {
                          ...selectedQuestion.validation,
                          max: parseInt(e.target.value)
                        });
                      }}
                      className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Weight input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question Weight
                </label>
                <input
                  type="number"
                  value={selectedQuestion.weight || 1}
                  onChange={(e) => handleQuestionChange('weight', parseInt(e.target.value))}
                  min="1"
                  max="10"
                  className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-sm text-gray-400 mt-1">Weight determines the importance of this question (1-10)</p>
              </div>

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
            onClick={() => {
              // Validate questions before saving
              if (questions.some(q => !q.text.trim())) {
                alert('All questions must have text');
                return;
              }
              if (questions.some(q => 
                (q.type === 'multipleChoice' || q.type === 'radio') && 
                (!q.options?.length || q.options.some(opt => !opt.trim()))
              )) {
                alert('All multiple choice or radio questions must have at least one option');
                return;
              }
              onSave(questions);
            }}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Save Questions
          </button>
        </div>
      </div>
    </div>
  );
} 