import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import type { CheckInTemplate, Question } from '@/types/checkIn';
import { getQuestionBank, type QuestionCategory } from '@/lib/questionBankService';

interface TemplateFormProps {
  onSubmit: (template: Omit<CheckInTemplate, 'id' | 'coachId' | 'createdAt' | 'updatedAt' | 'isActive'>) => Promise<void>;
  initialData?: CheckInTemplate;
}

export function TemplateForm({ onSubmit, initialData }: TemplateFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showQuestionBank, setShowQuestionBank] = useState(false);

  useEffect(() => {
    loadQuestionBank();
  }, []);

  const loadQuestionBank = async () => {
    try {
      const questionBank = await getQuestionBank();
      setCategories(questionBank);
    } catch (error) {
      console.error('Error loading question bank:', error);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        type: 'text',
        text: '',
        required: false,
      },
    ]);
  };

  const handleAddQuestionWithType = (type: Question['type']) => {
    setQuestions([
      ...questions,
      {
        id: `q-${Date.now()}`,
        type,
        text: '',
        required: false,
      },
    ]);
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  const handleQuestionChange = (questionId: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, [field]: value } : q
    ));
  };

  const handleAddFromBank = (question: Question) => {
    // Check if question already exists
    if (!questions.some(q => q.text === question.text)) {
      setQuestions([...questions, { ...question, id: `q-${Date.now()}` }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Add the two standard questions if they don't exist
      const standardQuestions: Question[] = [
        {
          id: 'standard-notes',
          type: 'text',
          text: 'Do you have any notes or requests for your coach?',
          required: false,
        },
        {
          id: 'standard-win',
          type: 'text',
          text: 'What is the biggest win you have had since last check in?',
          required: false,
        },
      ];

      // Filter out any existing standard questions to avoid duplicates
      const customQuestions = questions.filter(q => 
        !standardQuestions.some(sq => sq.text === q.text)
      );

      await onSubmit({
        title,
        description,
        questions: [...customQuestions, ...standardQuestions],
      });
    } catch (error) {
      console.error('Error submitting template:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Template Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          required
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Add New Question
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button
            type="button"
            onClick={() => handleAddQuestionWithType('text')}
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
          >
            <span className="text-2xl mb-2">📝</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Text</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddQuestionWithType('number')}
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
          >
            <span className="text-2xl mb-2">🔢</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Number</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddQuestionWithType('select')}
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
          >
            <span className="text-2xl mb-2">📋</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dropdown</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddQuestionWithType('multiselect')}
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
          >
            <span className="text-2xl mb-2">☑️</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Multi-select</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddQuestionWithType('checkbox')}
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
          >
            <span className="text-2xl mb-2">✅</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Checkbox</span>
          </button>
          <button
            type="button"
            onClick={() => handleAddQuestionWithType('rating')}
            className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
          >
            <span className="text-2xl mb-2">⭐</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rating</span>
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Questions
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowQuestionBank(!showQuestionBank)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
            >
              {showQuestionBank ? 'Hide Question Bank' : 'Show Question Bank'}
              <ChevronDownIcon className={`h-4 w-4 ml-1 transform ${showQuestionBank ? 'rotate-180' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add Custom Question
            </button>
          </div>
        </div>

        {showQuestionBank && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Question Bank
            </h3>
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {category.questions.map((question) => (
                      <button
                        key={question.id}
                        type="button"
                        onClick={() => handleAddFromBank(question)}
                        className="text-left p-2 rounded-md border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
                      >
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {question.text}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {question.type.charAt(0).toUpperCase() + question.type.slice(1)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => handleQuestionChange(question.id, 'text', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Type
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Select</option>
                      <option value="multiselect">Multi-select</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="rating">Rating</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) => handleQuestionChange(question.id, 'required', e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Required
                      </span>
                    </label>
                  </div>
                </div>

                {(question.type === 'select' || question.type === 'multiselect') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Options (one per line)
                    </label>
                    <textarea
                      value={question.options?.join('\n') || ''}
                      onChange={(e) => handleQuestionChange(question.id, 'options', e.target.value.split('\n').filter(Boolean))}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </div>
                )}

                {(question.type === 'number' || question.type === 'rating') && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Min
                      </label>
                      <input
                        type="number"
                        value={question.min || ''}
                        onChange={(e) => handleQuestionChange(question.id, 'min', e.target.value ? Number(e.target.value) : undefined)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Max
                      </label>
                      <input
                        type="number"
                        value={question.max || ''}
                        onChange={(e) => handleQuestionChange(question.id, 'max', e.target.value ? Number(e.target.value) : undefined)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Step
                      </label>
                      <input
                        type="number"
                        value={question.step || ''}
                        onChange={(e) => handleQuestionChange(question.id, 'step', e.target.value ? Number(e.target.value) : undefined)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemoveQuestion(question.id)}
                className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Template'}
        </button>
      </div>
    </form>
  );
} 