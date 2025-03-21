'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormTemplate, Question } from '@/lib/types/forms';
import { defaultTemplates } from '@/lib/data/form-templates';
import { 
  PlusIcon, 
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';

interface Coach {
  id: string;
  name: string;
  email: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  coachId: string;
}

interface QuestionCategory {
  id: string;
  name: string;
  subcategories: string[];
}

const categories: QuestionCategory[] = [
  {
    id: 'training',
    name: 'Training',
    subcategories: ['Strength', 'Cardio', 'Flexibility', 'Form']
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    subcategories: ['Meals', 'Hydration', 'Supplements', 'Cravings']
  },
  {
    id: 'recovery',
    name: 'Recovery',
    subcategories: ['Sleep', 'Stress', 'Soreness', 'Energy']
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    subcategories: ['Habits', 'Motivation', 'Challenges', 'Goals']
  }
];

const priorities = ['Vital', 'Important', 'Optional'];

export default function EditTemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');

  const [template, setTemplate] = useState<FormTemplate | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedCoach, setSelectedCoach] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isAdmin, setIsAdmin] = useState(true); // TODO: Replace with actual auth check

  useEffect(() => {
    // TODO: Replace with actual API calls
    const loadTemplate = () => {
      if (templateId) {
        const found = defaultTemplates.find(t => t.id === templateId);
        if (found) {
          setTemplate({
            ...found,
            id: `${found.id}-${Date.now()}`,
            name: `${found.name} (Copy)`,
            isTemplate: false,
          });
        }
      }
    };

    const loadCoachesAndClients = async () => {
      // TODO: Replace with actual API calls
      setCoaches([
        { id: '1', name: 'Coach Smith', email: 'coach1@example.com' },
        { id: '2', name: 'Coach Johnson', email: 'coach2@example.com' },
      ]);

      setClients([
        { id: '1', name: 'John Doe', email: 'john@example.com', coachId: '1' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', coachId: '1' },
        { id: '3', name: 'Bob Wilson', email: 'bob@example.com', coachId: '2' },
      ]);
    };

    loadTemplate();
    loadCoachesAndClients();
  }, [templateId]);

  useEffect(() => {
    if (selectedCoach) {
      setFilteredClients(clients.filter(client => client.coachId === selectedCoach));
    } else {
      setFilteredClients(clients);
    }
  }, [selectedCoach, clients]);

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    if (!template) return;
    const newQuestions = [...template.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setTemplate({ ...template, questions: newQuestions });
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (!template) return;
    const newQuestions = [...template.questions];
    if (direction === 'up' && index > 0) {
      [newQuestions[index], newQuestions[index - 1]] = [newQuestions[index - 1], newQuestions[index]];
    } else if (direction === 'down' && index < newQuestions.length - 1) {
      [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    }
    setTemplate({ ...template, questions: newQuestions });
  };

  const handleDeleteQuestion = (index: number) => {
    if (!template) return;
    const newQuestions = template.questions.filter((_, i) => i !== index);
    setTemplate({ ...template, questions: newQuestions });
  };

  const handleSave = async () => {
    if (!template) return;
    
    const formData = {
      ...template,
      coachId: selectedCoach,
      clientId: selectedClient,
      updatedAt: new Date(),
    };

    // TODO: Replace with actual API call
    console.log('Saving form:', formData);
    router.push('/admin/forms');
  };

  if (!template) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Form Template</h1>

          {/* Basic Information */}
          <div className="space-y-4 mb-8">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Form Name</label>
              <input
                type="text"
                id="name"
                value={template.name}
                onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                value={template.description}
                onChange={(e) => setTemplate({ ...template, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Allocation Section */}
          {isAdmin && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Allocate Form</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="coach" className="block text-sm font-medium text-gray-700">Assign to Coach</label>
                  <select
                    id="coach"
                    value={selectedCoach}
                    onChange={(e) => setSelectedCoach(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a coach</option>
                    {coaches.map((coach) => (
                      <option key={coach.id} value={coach.id}>{coach.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="client" className="block text-sm font-medium text-gray-700">Assign to Client</label>
                  <select
                    id="client"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    disabled={!selectedCoach}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a client</option>
                    {filteredClients.map((client) => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Questions Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Questions</h2>
            <div className="space-y-6">
              {template.questions.map((question, index) => (
                <div key={question.id} className="bg-gray-900 rounded-lg p-6 relative group">
                  <div className="absolute right-4 top-4 hidden group-hover:flex items-center space-x-2">
                    <button
                      onClick={() => handleMoveQuestion(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-200 disabled:opacity-50"
                    >
                      <ArrowUpIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveQuestion(index, 'down')}
                      disabled={index === template.questions.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-200 disabled:opacity-50"
                    >
                      <ArrowDownIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(index)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Question Text */}
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-1">Question Text</label>
                      <textarea
                        value={question.text}
                        onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                        rows={2}
                        className="w-full rounded-md bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Question Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">Question Type</label>
                        <select
                          value={question.type}
                          onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                          className="w-full rounded-md bg-gray-800 border-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500"
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

                      {/* Priority */}
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">Priority</label>
                        <select
                          value={question.priority || 'Optional'}
                          onChange={(e) => handleQuestionChange(index, 'priority', e.target.value)}
                          className="w-full rounded-md bg-gray-800 border-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          {priorities.map(priority => (
                            <option key={priority} value={priority}>{priority}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Category */}
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">Category</label>
                        <select
                          value={question.category || ''}
                          onChange={(e) => handleQuestionChange(index, 'category', e.target.value)}
                          className="w-full rounded-md bg-gray-800 border-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500"
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Subcategories */}
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">Subcategories</label>
                        <div className="bg-gray-800 rounded-md border border-gray-700 p-2 space-y-1">
                          {question.category && categories.find(c => c.id === question.category)?.subcategories.map(sub => (
                            <label key={sub} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={question.subcategories?.includes(sub) || false}
                                onChange={(e) => {
                                  const current = question.subcategories || [];
                                  const updated = e.target.checked
                                    ? [...current, sub]
                                    : current.filter(s => s !== sub);
                                  handleQuestionChange(index, 'subcategories', updated);
                                }}
                                className="rounded border-gray-600 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-sm text-gray-200">{sub}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Options for select/multiselect */}
                    {(question.type === 'select' || question.type === 'multiselect') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">Options (one per line)</label>
                        <textarea
                          value={question.options?.join('\n') || ''}
                          onChange={(e) => {
                            const options = e.target.value.split('\n').filter(Boolean);
                            handleQuestionChange(index, 'options', options);
                          }}
                          rows={4}
                          placeholder="Enter each option on a new line"
                          className="w-full rounded-md bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    )}

                    {/* Additional settings based on question type */}
                    {question.type === 'rating_scale' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-1">Min Value</label>
                          <input
                            type="number"
                            value={question.minValue || 0}
                            onChange={(e) => handleQuestionChange(index, 'minValue', parseInt(e.target.value))}
                            className="w-full rounded-md bg-gray-800 border-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-200 mb-1">Max Value</label>
                          <input
                            type="number"
                            value={question.maxValue || 5}
                            onChange={(e) => handleQuestionChange(index, 'maxValue', parseInt(e.target.value))}
                            className="w-full rounded-md bg-gray-800 border-gray-700 text-white focus:border-indigo-500 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    )}

                    {question.type === 'number' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-1">Unit</label>
                        <input
                          type="text"
                          value={question.unit || ''}
                          onChange={(e) => handleQuestionChange(index, 'unit', e.target.value)}
                          placeholder="e.g., kg, lbs, minutes"
                          className="w-full rounded-md bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Question Button */}
            <button
              type="button"
              onClick={() => {
                if (!template) return;
                const newQuestion: Question = {
                  id: `question-${Date.now()}`,
                  type: 'text',
                  text: '',
                  required: false,
                  category: '',
                  subcategories: [],
                  priority: 'Optional'
                };
                setTemplate({
                  ...template,
                  questions: [...template.questions, newQuestion],
                });
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-200 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Question
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Form
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 