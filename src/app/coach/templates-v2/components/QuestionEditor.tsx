import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Question {
  id: string;
  text: string;
  type: 'text' | 'yesNo' | 'multipleChoice' | 'scale' | 'radio';
  required: boolean;
  weight?: number;
  yesIsPositive?: boolean; // Whether a "Yes" answer is considered positive
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
  };
}

interface QuestionEditorProps {
  question: Question;
  onSave: (question: Question) => void;
  onClose: () => void;
}

const QUESTION_TYPES = [
  { value: 'text', label: 'Text Response' },
  { value: 'yesNo', label: 'Yes/No' },
  { value: 'multipleChoice', label: 'Multiple Choice' },
  { value: 'radio', label: 'Single Choice' },
  { value: 'scale', label: 'Scale' }
];

export default function QuestionEditor({
  question: initialQuestion,
  onSave,
  onClose
}: QuestionEditorProps) {
  const [question, setQuestion] = useState<Question>(initialQuestion);
  const [newOption, setNewOption] = useState('');

  const handleChange = (field: keyof Question, value: any) => {
    setQuestion(prev => ({ ...prev, [field]: value }));
  };

  const handleAddOption = () => {
    if (newOption.trim() && question.options) {
      handleChange('options', [...question.options, newOption.trim()]);
      setNewOption('');
    }
  };

  const handleRemoveOption = (index: number) => {
    if (question.options) {
      handleChange(
        'options',
        question.options.filter((_, i) => i !== index)
      );
    }
  };

  const handleSave = () => {
    // Validate question before saving
    if (!question.text.trim()) {
      alert('Question text is required');
      return;
    }

    if (
      (question.type === 'multipleChoice' || question.type === 'radio') &&
      (!question.options || question.options.length < 2)
    ) {
      alert('Multiple choice questions must have at least 2 options');
      return;
    }

    onSave(question);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Edit Question</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Question Text
        </label>
        <textarea
          value={question.text}
          onChange={(e) => handleChange('text', e.target.value)}
          rows={3}
          className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter your question"
        />
      </div>

      {/* Question Type */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Question Type
        </label>
        <select
          value={question.type}
          onChange={(e) => {
            const newType = e.target.value as Question['type'];
            handleChange('type', newType);
            // Reset options when changing to multiple choice
            if (newType === 'multipleChoice' || newType === 'radio') {
              handleChange('options', []);
            }
            // Reset validation when changing to scale
            if (newType === 'scale') {
              handleChange('validation', { min: 1, max: 10 });
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

      {/* Options for multiple choice or radio */}
      {(question.type === 'multipleChoice' || question.type === 'radio') && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Options
          </label>
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...(question.options || [])];
                    newOptions[index] = e.target.value;
                    handleChange('options', newOptions);
                  }}
                  className="flex-1 bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleRemoveOption(index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                placeholder="Add new option"
                className="flex-1 bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddOption}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scale settings */}
      {question.type === 'scale' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Minimum Value
            </label>
            <input
              type="number"
              value={question.validation?.min || 1}
              onChange={(e) => {
                handleChange('validation', {
                  ...question.validation,
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
              value={question.validation?.max || 10}
              onChange={(e) => {
                handleChange('validation', {
                  ...question.validation,
                  max: parseInt(e.target.value)
                });
              }}
              className="w-full bg-[#2C2C30] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Weight Slider for Yes/No questions */}
      {question.type === 'yesNo' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Question Weight
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="10"
                value={question.weight || 5}
                onChange={(e) => handleChange('weight', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Nice to have done</span>
                <span className="text-indigo-400 font-medium">Weight: {question.weight || 5}</span>
                <span>Very important</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Answer Impact
            </label>
            <div className="flex items-center justify-between p-3 bg-[#2C2C30] rounded-lg">
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${question.yesIsPositive ? 'text-green-400' : 'text-red-400'}`}>
                  A "Yes" answer is {question.yesIsPositive ? 'positive' : 'negative'}
                </span>
              </div>
              <button
                onClick={() => handleChange('yesIsPositive', !question.yesIsPositive)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  question.yesIsPositive
                    ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                }`}
              >
                Toggle Impact
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Example: For "Did you exercise today?", "Yes" is positive. For "Did you smoke today?", "Yes" is negative.
            </p>
          </div>
        </div>
      )}

      {/* Required Toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="required"
          checked={question.required}
          onChange={(e) => handleChange('required', e.target.checked)}
          className="h-4 w-4 rounded border-gray-700 text-indigo-600 focus:ring-indigo-500 bg-[#2C2C30]"
        />
        <label htmlFor="required" className="ml-2 text-sm text-gray-300">
          This question is required
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Save Question
        </button>
      </div>
    </div>
  );
} 