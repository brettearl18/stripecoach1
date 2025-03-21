'use client';

import { Fragment, useState } from 'react';
import { ArrowLeftIcon, PlusIcon, SparklesIcon, PencilSquareIcon, ScaleIcon, ChatBubbleBottomCenterTextIcon, HashtagIcon, ListBulletIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AIQuestionnaireModal } from './AIQuestionnaireModal';
import { ClientProfileModal, ClientProfile } from './ClientProfileModal';
import { saveCheckInForm } from '@/lib/services/firebaseService';
import type { CheckInForm, Client } from '@/lib/services/firebaseService';
import toast, { Toaster } from 'react-hot-toast';
import ClientSelector from './ClientSelector';
import CheckInFormView from './CheckInFormView';

interface FormBuilderProps {
  onSave?: (formData: any) => void;
}

const validateForm = (formData: CheckInForm): string[] => {
  const errors: string[] = [];

  // Basic validation
  if (!formData.name.trim()) {
    errors.push('Form name is required');
  } else if (formData.name.length < 3) {
    errors.push('Form name must be at least 3 characters long');
  }

  if (!formData.description.trim()) {
    errors.push('Form description is required');
  }

  if (formData.questions.length === 0) {
    errors.push('At least one question is required');
  }

  // Validate questions
  formData.questions.forEach((question, index) => {
    if (!question.text.trim()) {
      errors.push(`Question ${index + 1} text is required`);
    }
    if (question.type === 'multiple_choice' && (!question.options || question.options.length < 2)) {
      errors.push(`Question ${index + 1} must have at least 2 options`);
    }
  });

  // Validate time logic
  const fromDay = formData.availableFrom.day;
  const toDay = formData.dueBy.day;
  const fromTime = formData.availableFrom.time;
  const toTime = formData.dueBy.time;
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const fromDayIndex = days.indexOf(fromDay);
  const toDayIndex = days.indexOf(toDay);
  
  if (fromDayIndex === toDayIndex && fromTime >= toTime) {
    errors.push('Due time must be after available time when on the same day');
  }

  return errors;
};

export default function FormBuilder({ onSave }: FormBuilderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CheckInForm>({
    name: '',
    description: '',
    frequency: 'weekly',
    availableFrom: {
      day: 'Monday',
      time: '09:00'
    },
    dueBy: {
      day: 'Tuesday',
      time: '17:00'
    },
    questions: []
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const handleProfileComplete = (profile: ClientProfile) => {
    setClientProfile(profile);
    setIsProfileModalOpen(false);
    setIsAIModalOpen(true);
  };

  const handleQuestionsGenerated = (questions: any[]) => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, ...questions]
    }));
    setIsAIModalOpen(false);
  };

  const handleEditQuestion = (index: number) => {
    setEditingQuestionIndex(index);
    setIsAIModalOpen(true);
  };

  const handleSaveForm = async () => {
    try {
      setIsLoading(true);
      
      // Validate form
      const errors = validateForm(formData);
      if (errors.length > 0) {
        errors.forEach(error => toast.error(error));
        return;
      }

      // Save to Firebase with selected clients
      const formId = await saveCheckInForm(formData, selectedClients.map(client => client.id!));
      toast.success('Form saved successfully!');
      
      // Call the onSave prop if provided
      if (onSave) {
        onSave(formData);
      }

      // Navigate to forms list
      router.push('/admin/forms');
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const questionTypeIcons = {
    scale: <ScaleIcon className="w-4 h-4" />,
    text: <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />,
    number: <HashtagIcon className="w-4 h-4" />,
    multiple_choice: <ListBulletIcon className="w-4 h-4" />,
    yes_no: <CheckCircleIcon className="w-4 h-4" />
  };

  return (
    <Fragment>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1A1F26',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="min-h-screen bg-[#0B0F15]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0B0F15]/95 backdrop-blur-sm px-6 py-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-3">
            <Link 
              href="/admin/forms"
              className="text-gray-400 hover:text-gray-300 flex items-center gap-2 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Forms
            </Link>
            <span className="text-xl font-medium text-white">Create New Form</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-700 hover:border-gray-600"
              disabled={formData.questions.length === 0}
            >
              Preview Form
            </button>
            <button
              onClick={() => router.push('/admin/forms')}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveForm}
              disabled={isLoading}
              className={`px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/20 flex items-center gap-2 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Form'
              )}
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-5xl mx-auto p-6 space-y-8">
          {/* Form Details Card */}
          <div className="bg-[#1A1F26] rounded-xl p-6 space-y-6 shadow-xl border border-gray-800/50">
            <h2 className="text-lg font-medium text-white mb-6">Form Details</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">Form Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter a descriptive name for your form"
                  className="w-full px-4 py-2 bg-[#2A303A] rounded-lg border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the purpose of this form"
                  rows={4}
                  className="w-full px-4 py-2 bg-[#2A303A] rounded-lg border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-200">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2A303A] rounded-lg border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-800">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">Available From</label>
                  <div className="flex gap-3">
                    <select
                      value={formData.availableFrom.day}
                      onChange={(e) => setFormData({
                        ...formData,
                        availableFrom: { ...formData.availableFrom, day: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 bg-[#2A303A] rounded-lg border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={formData.availableFrom.time}
                      onChange={(e) => setFormData({
                        ...formData,
                        availableFrom: { ...formData.availableFrom, time: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 bg-[#2A303A] rounded-lg border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-200">Due By</label>
                  <div className="flex gap-3">
                    <select
                      value={formData.dueBy.day}
                      onChange={(e) => setFormData({
                        ...formData,
                        dueBy: { ...formData.dueBy, day: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 bg-[#2A303A] rounded-lg border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={formData.dueBy.time}
                      onChange={(e) => setFormData({
                        ...formData,
                        dueBy: { ...formData.dueBy, time: e.target.value }
                      })}
                      className="flex-1 px-4 py-2 bg-[#2A303A] rounded-lg border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    />
                  </div>
                </div>
              </div>

              {/* Client Selection */}
              <div className="pt-6 border-t border-gray-800">
                <ClientSelector
                  selectedClients={selectedClients}
                  onSelectionChange={setSelectedClients}
                />
              </div>
            </div>
          </div>

          {/* Questions Section */}
          <div className="bg-[#1A1F26] rounded-xl p-6 shadow-xl border border-gray-800/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-medium text-white">Questions</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {formData.questions.length} questions added
                </p>
              </div>
              {formData.questions.length > 0 && (
                <div className="flex items-center gap-3">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-[#2A303A] text-white rounded-lg hover:bg-[#353B47] transition-colors border border-gray-700"
                    onClick={() => setIsProfileModalOpen(true)}
                  >
                    <SparklesIcon className="h-5 w-5 text-yellow-500" />
                    Create with AI
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/20"
                    onClick={() => {/* TODO: Add question handler */}}
                  >
                    <PlusIcon className="h-5 w-5" />
                    Add Question
                  </button>
                </div>
              )}
            </div>

            {/* Question List */}
            {formData.questions.length > 0 ? (
              <div className="space-y-4">
                {formData.questions.map((question, index) => (
                  <div
                    key={index}
                    className="p-4 bg-[#2A303A] rounded-lg flex items-start justify-between border border-gray-800 hover:border-gray-700 transition-colors group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-2 text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                          {questionTypeIcons[question.type]}
                          {question.type}
                        </span>
                        <span className="text-sm text-gray-100">{question.text}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {question.required && (
                          <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded">Required</span>
                        )}
                        {question.category && (
                          <span className="bg-gray-700/50 px-2 py-0.5 rounded">{question.category}</span>
                        )}
                        {question.subcategories?.length > 0 && (
                          <span className="bg-gray-700/50 px-2 py-0.5 rounded">
                            {question.subcategories.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditQuestion(index)}
                        className="p-1.5 text-gray-400 hover:text-indigo-400 transition-colors bg-[#1A1F26] rounded-lg border border-gray-700"
                        title="Edit question"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            questions: prev.questions.filter((_, i) => i !== index)
                          }));
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-400 transition-colors bg-[#1A1F26] rounded-lg border border-gray-700"
                        title="Delete question"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <p className="mb-8 text-center">Choose how you'd like to create your questions:</p>
                <div className="flex items-center gap-6">
                  <button
                    className="flex flex-col items-center gap-4 p-6 bg-[#2A303A] rounded-xl hover:bg-[#353B47] transition-colors border border-gray-700 hover:border-gray-600 group"
                    onClick={() => {/* TODO: Add question handler */}}
                  >
                    <div className="p-4 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                      <PlusIcon className="h-8 w-8 text-indigo-500" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-white font-medium mb-1">Add a question</h3>
                      <p className="text-sm text-gray-400">Create custom questions manually</p>
                    </div>
                  </button>
                  
                  <button
                    className="flex flex-col items-center gap-4 p-6 bg-[#2A303A] rounded-xl hover:bg-[#353B47] transition-colors border border-gray-700 hover:border-gray-600 group"
                    onClick={() => setIsProfileModalOpen(true)}
                  >
                    <div className="p-4 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                      <SparklesIcon className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-white font-medium mb-1">Build with AI</h3>
                      <p className="text-sm text-gray-400">Generate questions automatically</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {isPreviewModalOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsPreviewModalOpen(false)} />
            <div className="relative z-10 h-full overflow-auto">
              <CheckInFormView
                form={formData}
                onSubmit={() => setIsPreviewModalOpen(false)}
                isPreview
              />
            </div>
          </div>
        )}

        {/* Client Profile Modal */}
        <ClientProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          onProfileComplete={handleProfileComplete}
        />

        {/* AI Questionnaire Modal */}
        <AIQuestionnaireModal
          isOpen={isAIModalOpen}
          onClose={() => {
            setIsAIModalOpen(false);
            setEditingQuestionIndex(null);
          }}
          onQuestionsGenerated={(questions) => {
            if (editingQuestionIndex !== null) {
              // Replace the edited question
              setFormData(prev => ({
                ...prev,
                questions: prev.questions.map((q, i) => 
                  i === editingQuestionIndex ? questions[0] : q
                )
              }));
              setEditingQuestionIndex(null);
            } else {
              // Add new questions
              setFormData(prev => ({
                ...prev,
                questions: [...prev.questions, ...questions]
              }));
            }
            setIsAIModalOpen(false);
          }}
          clientProfile={clientProfile}
          editingQuestion={editingQuestionIndex !== null ? formData.questions[editingQuestionIndex] : undefined}
        />
      </div>
    </Fragment>
  );
} 