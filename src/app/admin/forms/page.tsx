'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { defaultTemplates } from '@/lib/data/form-templates';
import { FormTemplate } from '@/lib/types/forms';

export default function FormsPage() {
  const [activeTab, setActiveTab] = useState<'my-forms' | 'templates'>('my-forms');
  
  // In a real app, this would come from your database
  const [myForms, setMyForms] = useState<FormTemplate[]>([]);

  const handleDuplicateTemplate = (template: FormTemplate) => {
    const newForm: FormTemplate = {
      ...template,
      id: `${template.id}-copy-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isTemplate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'current-coach-id' // This would come from your auth system
    };
    setMyForms([...myForms, newForm]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Check-in Forms</h1>
          <Link
            href="/admin/forms/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create New Form
          </Link>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('my-forms')}
              className={`${
                activeTab === 'my-forms'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Forms
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`${
                activeTab === 'templates'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Templates
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activeTab === 'my-forms' ? (
            myForms.length > 0 ? (
              myForms.map((form) => (
                <div
                  key={form.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{form.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{form.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {form.categories.map((category) => (
                        <span
                          key={category}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/admin/forms/${form.id}`}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">You haven't created any forms yet.</p>
                <Link
                  href="/admin/forms/new"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create your first form
                </Link>
              </div>
            )
          ) : (
            defaultTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{template.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {template.categories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleDuplicateTemplate(template)}
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                  >
                    <DocumentDuplicateIcon className="h-5 w-5 mr-1" />
                    Use Template
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 