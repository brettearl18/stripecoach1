'use client';

import { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { TemplateForm } from '@/components/checkIn/TemplateForm';
import { useCheckIn } from '@/hooks/useCheckIn';
import type { CheckInTemplate } from '@/types/checkIn';

export default function TemplatesPage() {
  const { templates, loading, error, createTemplate, updateTemplate } = useCheckIn();
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CheckInTemplate | null>(null);

  const handleCreateTemplate = async (template: Omit<CheckInTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'coachId'>) => {
    try {
      await createTemplate(template);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleUpdateTemplate = async (template: Omit<CheckInTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isActive' | 'coachId'>) => {
    if (!editingTemplate) return;
    
    try {
      await updateTemplate(editingTemplate.id, template);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Check-in Templates
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5" />
            New Template
          </button>
        </div>

        {showForm && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingTemplate ? 'Edit Template' : 'Create New Template'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingTemplate(null);
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TemplateForm
              onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
              initialData={editingTemplate || undefined}
            />
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {template.title}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingTemplate(template);
                      setShowForm(true);
                    }}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => updateTemplate(template.id, { isActive: !template.isActive })}
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      template.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}
                  >
                    {template.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {template.description}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Questions:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {template.questions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Created:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 