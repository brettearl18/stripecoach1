import { useState } from 'react';
import { Modal } from '../Modal';
import { Question, QuestionType } from '@/lib/types/forms';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (question: Partial<Question>) => void;
}

interface QuestionTypeOption {
  id: QuestionType;
  icon: string;
  title: string;
  description: string;
}

const questionTypes: QuestionTypeOption[] = [
  {
    id: 'text',
    icon: '📝',
    title: 'Text',
    description: 'Small or long text like title or description'
  },
  {
    id: 'number',
    icon: '1️⃣',
    title: 'Number',
    description: 'Numbers (integer, float, decimal)'
  },
  {
    id: 'multiple_choice',
    icon: '📋',
    title: 'Multiple Choice',
    description: 'Give multiple options to choose from'
  },
  {
    id: 'rating_scale',
    icon: '📊',
    title: 'Scale',
    description: 'A scale from 1 to 10'
  },
  {
    id: 'checkbox',
    icon: '✅',
    title: 'Yes/No',
    description: 'Yes or no'
  },
  {
    id: 'date',
    icon: '📅',
    title: 'Date',
    description: 'Select a specific date'
  },
  {
    id: 'photo',
    icon: '📸',
    title: 'Media',
    description: 'One image or video'
  },
  {
    id: 'rating',
    icon: '⭐',
    title: 'Star Rating',
    description: 'Star rating from 1 to 5'
  }
];

const syncedTypes = [
  {
    id: 'progress_photos',
    icon: '📸',
    title: 'Progress Photos',
    description: 'Sync "Front, Back, Side" photos to gallery'
  },
  {
    id: 'metric',
    icon: '📏',
    title: 'Metric',
    description: 'Sync to Metrics section automatically'
  }
];

export function AddQuestionModal({ isOpen, onClose, onAdd }: AddQuestionModalProps) {
  const [questionText, setQuestionText] = useState('');
  const [isRequired, setIsRequired] = useState(false);

  const handleSubmit = (type: QuestionType) => {
    if (!questionText.trim()) return;

    onAdd({
      text: questionText,
      type,
      required: isRequired
    });

    setQuestionText('');
    setIsRequired(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Question">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
            Question <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Your question e.g. How are you feeling today?"
            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-base px-4 py-3"
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Required?</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {questionTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleSubmit(type.id)}
              className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors text-left"
            >
              <span className="text-2xl">{type.icon}</span>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{type.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{type.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Synced Questions</h4>
          <div className="grid grid-cols-2 gap-4">
            {syncedTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => handleSubmit(type.id as QuestionType)}
                className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors text-left"
              >
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{type.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{type.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
} 