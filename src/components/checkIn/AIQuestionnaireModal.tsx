'use client';

import { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { generateQuestions } from '@/lib/services/aiService';
import { ClientProfile } from './ClientProfileModal';
import { SparklesIcon, TrashIcon } from '@heroicons/react/24/outline';

interface AIQuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionsGenerated: (questions: any[]) => void;
  clientProfile?: ClientProfile;
  editingQuestion?: Question;
}

interface Question {
  text: string;
  type: 'scale' | 'text' | 'number' | 'multiple_choice' | 'yes_no';
  required: boolean;
  options?: string[];
  priority: 'vital' | 'intermediate' | 'optional';
  category?: string;
  subcategories?: string[];
  selected?: boolean;
}

export function AIQuestionnaireModal({ 
  isOpen, 
  onClose, 
  onQuestionsGenerated, 
  clientProfile,
  editingQuestion 
}: AIQuestionnaireModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [showRegeneratePrompt, setShowRegeneratePrompt] = useState(false);
  const [questionsToRegenerate, setQuestionsToRegenerate] = useState<number[]>([]);

  const categories = [
    'Weight Management',
    'Nutrition',
    'Training',
    'Recovery',
    'Wellness',
    'Mental Health',
    'Sleep',
    'Lifestyle'
  ];

  const subcategories = {
    'Weight Management': ['Weight Loss', 'Weight Gain', 'Maintenance'],
    'Nutrition': ['Meal Planning', 'Macros', 'Hydration', 'Supplements'],
    'Training': ['Strength', 'Cardio', 'Flexibility', 'Form'],
    'Recovery': ['Rest Days', 'Mobility', 'Injury Prevention'],
    'Wellness': ['Energy Levels', 'Stress', 'Daily Habits'],
    'Mental Health': ['Motivation', 'Mindset', 'Goals'],
    'Sleep': ['Quality', 'Duration', 'Routine'],
    'Lifestyle': ['Work-Life Balance', 'Social Support', 'Environment']
  };

  const simulateProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 500);
    return interval;
  };

  // Initialize with editing question if provided
  useEffect(() => {
    if (editingQuestion) {
      setGeneratedQuestions([editingQuestion]);
    } else {
      setGeneratedQuestions([]);
    }
  }, [editingQuestion]);

  const handleGenerateQuestions = async (regenerateSelected: boolean = false) => {
    if (!clientProfile) return;
    
    if (regenerateSelected && questionsToRegenerate.length === 0) {
      return; // Don't regenerate if no questions are selected
    }
    
    setIsGenerating(true);
    const progressInterval = simulateProgress();

    try {
      if (regenerateSelected) {
        // Keep unselected questions
        const unselectedQuestions = generatedQuestions.filter((_, idx) => !questionsToRegenerate.includes(idx));
        const selectedCount = questionsToRegenerate.length;
        
        const newQuestions = await generateQuestions(clientProfile);
        // Take only the number of questions that were selected for regeneration
        const regeneratedQuestions = newQuestions.slice(0, selectedCount);
        
        setGeneratedQuestions([
          ...unselectedQuestions,
          ...regeneratedQuestions.map(q => ({ ...q, selected: false }))
        ]);
      } else {
        const questions = await generateQuestions(clientProfile);
        setGeneratedQuestions(questions.map(q => ({ ...q, selected: false, subcategories: [] })));
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      setShowRegeneratePrompt(false);
      setQuestionsToRegenerate([]);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 500);
    }
  };

  const handleSaveQuestions = () => {
    // Convert subcategories array to string for backward compatibility
    const processedQuestions = generatedQuestions.map(({ selected, subcategories, ...q }) => ({
      ...q,
      subcategory: subcategories?.join(', ') || ''
    }));
    onQuestionsGenerated(processedQuestions);
    setGeneratedQuestions([]);
    onClose();
  };

  const handleEditQuestion = (index: number, field: keyof Question, value: any) => {
    setGeneratedQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const toggleQuestionSelection = (index: number) => {
    setQuestionsToRegenerate(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const toggleSubcategory = (index: number, subcategory: string) => {
    setGeneratedQuestions(prev => {
      const updated = [...prev];
      const question = updated[index];
      const subcategories = question.subcategories || [];
      
      if (subcategories.includes(subcategory)) {
        question.subcategories = subcategories.filter(sub => sub !== subcategory);
      } else {
        question.subcategories = [...subcategories, subcategory];
      }
      
      return updated;
    });
  };

  const handleRegenerateClick = () => {
    if (questionsToRegenerate.length > 0) {
      setShowRegeneratePrompt(true);
    }
  };

  const handleRegenerateQuestion = async (index: number) => {
    if (!clientProfile) return;
    
    setIsGenerating(true);
    const progressInterval = simulateProgress();

    try {
      const newQuestions = await generateQuestions(clientProfile);
      // Take just one new question to replace the selected one
      const newQuestion = newQuestions[0];
      
      setGeneratedQuestions(prev => {
        const updated = [...prev];
        updated[index] = { ...newQuestion, subcategories: [] };
        return updated;
      });
      
      clearInterval(progressInterval);
      setProgress(100);
    } catch (error) {
      console.error('Error regenerating question:', error);
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setProgress(0);
      }, 500);
    }
  };

  const handleDeleteQuestion = (index: number) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubcategoryChange = (index: number, subcategory: string, checked: boolean) => {
    setGeneratedQuestions(prev => {
      const updated = [...prev];
      const question = { ...updated[index] };
      const subcategories = question.subcategories || [];
      
      if (checked) {
        question.subcategories = [...subcategories, subcategory];
      } else {
        question.subcategories = subcategories.filter(sub => sub !== subcategory);
      }
      
      updated[index] = question;
      return updated;
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/80" />
        </Transition.Child>

        {showRegeneratePrompt && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
              <div className="relative transform overflow-hidden rounded-lg bg-[#1A1F26] px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <h3 className="text-base font-semibold leading-6 text-gray-200">
                      Regenerate Selected Questions?
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">
                        This will regenerate {questionsToRegenerate.length} selected question(s). This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:w-auto"
                    onClick={() => handleGenerateQuestions(true)}
                  >
                    Regenerate
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-[#2A303A] px-3 py-2 text-sm font-semibold text-gray-300 shadow-sm ring-1 ring-inset ring-gray-700 hover:bg-[#2A303A]/80 sm:mt-0 sm:w-auto"
                    onClick={() => setShowRegeneratePrompt(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-[#1A1F26] p-6 shadow-xl transition-all">
                <Dialog.Title className="text-lg font-medium text-white mb-4">
                  {editingQuestion ? 'Edit Question' : 'Generate Questions with AI'}
                </Dialog.Title>

                {isGenerating ? (
                  <div className="space-y-4 py-8">
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>Generating personalized questions...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ) : generatedQuestions.length > 0 ? (
                  <div className="space-y-6">
                    <p className="text-sm text-gray-400">
                      {editingQuestion 
                        ? 'Edit the question below or regenerate it with AI.'
                        : 'Review and edit the generated questions below. Select questions to regenerate them.'
                      }
                    </p>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {generatedQuestions.map((question, index) => (
                        <div key={index} className="p-4 bg-[#2A303A] rounded-lg space-y-4 group relative">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <label className="block text-sm font-medium text-gray-200">
                                Question Text
                              </label>
                              <textarea
                                value={question.text}
                                onChange={(e) => handleEditQuestion(index, 'text', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1A1F26] rounded-lg border border-gray-700 text-gray-100"
                                rows={2}
                              />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
                              <button
                                onClick={() => handleRegenerateQuestion(index)}
                                className="p-2 text-gray-400 hover:text-indigo-400 transition-colors bg-[#1A1F26] rounded-lg border border-gray-700"
                                title="Regenerate this question"
                              >
                                <SparklesIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(index)}
                                className="p-2 text-gray-400 hover:text-red-400 transition-colors bg-[#1A1F26] rounded-lg border border-gray-700"
                                title="Delete this question"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-200 mb-1">
                                Question Type
                              </label>
                              <select
                                value={question.type}
                                onChange={(e) => handleEditQuestion(index, 'type', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1A1F26] rounded-lg border border-gray-700 text-gray-100"
                              >
                                <option value="scale">Scale (1-10)</option>
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="yes_no">Yes/No</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-200 mb-1">
                                Priority
                              </label>
                              <select
                                value={question.priority}
                                onChange={(e) => handleEditQuestion(index, 'priority', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1A1F26] rounded-lg border border-gray-700 text-gray-100"
                              >
                                <option value="vital">Vital</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="optional">Optional</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-200 mb-1">
                                Category
                              </label>
                              <select
                                value={question.category}
                                onChange={(e) => handleEditQuestion(index, 'category', e.target.value)}
                                className="w-full px-3 py-2 bg-[#1A1F26] rounded-lg border border-gray-700 text-gray-100"
                              >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-200 mb-1">
                                Subcategories
                              </label>
                              <div className="space-y-2 max-h-32 overflow-y-auto bg-[#1A1F26] rounded-lg border border-gray-700 p-2">
                                {question.category && subcategories[question.category]?.map(sub => (
                                  <label key={sub} className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={question.subcategories?.includes(sub) || false}
                                      onChange={(e) => handleSubcategoryChange(index, sub, e.target.checked)}
                                      className="h-4 w-4 rounded border-gray-700 bg-[#1A1F26] text-indigo-600"
                                    />
                                    <span className="text-sm text-gray-200">{sub}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>

                          {question.type === 'multiple_choice' && (
                            <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-200">
                                Options (one per line)
                              </label>
                              <textarea
                                value={question.options?.join('\n') || ''}
                                onChange={(e) => handleEditQuestion(index, 'options', e.target.value.split('\n'))}
                                className="w-full px-3 py-2 bg-[#1A1F26] rounded-lg border border-gray-700 text-gray-100"
                                rows={3}
                                placeholder="Enter options, one per line"
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-2">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => handleEditQuestion(index, 'required', e.target.checked)}
                              className="h-4 w-4 rounded border-gray-700 bg-[#1A1F26] text-indigo-600"
                            />
                            <label className="text-sm text-gray-200">Required</label>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      {editingQuestion ? (
                        <button
                          onClick={() => handleGenerateQuestions(false)}
                          className="px-4 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Regenerate Question
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGenerateQuestions(false)}
                          className="px-4 py-2 text-sm bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Regenerate All
                        </button>
                      )}
                      <button
                        onClick={handleSaveQuestions}
                        className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/20"
                      >
                        {editingQuestion ? 'Save Changes' : 'Save Questions'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <button
                      onClick={() => handleGenerateQuestions(false)}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/20"
                    >
                      {editingQuestion ? 'Regenerate Question' : 'Generate Questions'}
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 