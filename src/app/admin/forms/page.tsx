'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  DocumentDuplicateIcon, 
  ClipboardDocumentIcon, 
  EyeIcon,
  PencilIcon,
  ChatBubbleBottomCenterTextIcon,
  HashtagIcon,
  ListBulletIcon,
  CheckCircleIcon,
  StarIcon,
  PhotoIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';
import { defaultTemplates } from '@/lib/data/form-templates';
import { FormTemplate } from '@/lib/types/forms';

export default function FormsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'my-forms' | 'templates'>('templates');
  const [myForms, setMyForms] = useState<FormTemplate[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<FormTemplate | null>(null);

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-blue-500" />;
      case 'number':
        return <HashtagIcon className="h-5 w-5 text-purple-500" />;
      case 'select':
        return <ArrowsUpDownIcon className="h-5 w-5 text-green-500" />;
      case 'multiselect':
        return <ListBulletIcon className="h-5 w-5 text-teal-500" />;
      case 'checkbox':
        return <CheckCircleIcon className="h-5 w-5 text-indigo-500" />;
      case 'rating_scale':
        return <StarIcon className="h-5 w-5 text-amber-500" />;
      case 'photo':
        return <PhotoIcon className="h-5 w-5 text-rose-500" />;
      default:
        return <ClipboardDocumentIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleDuplicateTemplate = (template: FormTemplate) => {
    router.push(`/admin/forms/edit?templateId=${template.id}`);
  };

  return (
    <div className="min-h-screen bg-[#13141A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Check-in Forms</h1>
            <p className="text-gray-400">Create and manage your client check-in forms</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center">
            <span className="mr-2">+</span>
            Create New Form
          </button>
        </div>

        <div className="mb-6 border-b border-gray-800">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('templates')}
              className={`pb-4 text-sm font-medium relative ${
                activeTab === 'templates' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Templates
              {activeTab === 'templates' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('my-forms')}
              className={`pb-4 text-sm font-medium relative ${
                activeTab === 'my-forms' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              My Forms
              {activeTab === 'my-forms' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'my-forms' ? (
            myForms.length > 0 ? (
              myForms.map((form) => (
                <div
                  key={form.id}
                  className="bg-[#1a1b1e] rounded-lg p-6 border border-gray-800"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {form.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        {form.description}
                      </p>
                    </div>
                    <Link
                      href={`/admin/forms/${form.id}`}
                      className="text-gray-400 hover:text-white"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {form.categories.map((category) => (
                      <span
                        key={category}
                        className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center text-sm text-gray-400 mb-4">
                    <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                    {form.questions.length} questions
                  </div>
                  <div className="space-y-3">
                    <button
                      className="w-full py-2 bg-[#13141A] text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
                      onClick={() => setPreviewTemplate(form)}
                    >
                      Preview Template
                    </button>
                    <button
                      className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      onClick={() => handleDuplicateTemplate(form)}
                    >
                      Use Template
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <div className="text-center rounded-lg border-2 border-dashed border-gray-800 p-12">
                  <ClipboardDocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-semibold text-gray-400">No forms yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new form or using a template</p>
                  <div className="mt-6">
                    <Link
                      href="/admin/forms/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Create your first form
                    </Link>
                  </div>
                </div>
              </div>
            )
          ) : (
            defaultTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-[#1a1b1e] rounded-lg p-6 border border-gray-800"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {template.name}
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      {template.description}
                    </p>
                  </div>
                  <button
                    className="text-gray-400 hover:text-white"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.categories.map((category) => (
                    <span
                      key={category}
                      className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                  {template.questions.length} questions
                </div>
                <div className="space-y-3">
                  <button
                    className="w-full py-2 bg-[#13141A] text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    Preview Template
                  </button>
                  <button
                    className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setPreviewTemplate(null)}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-xl font-semibold leading-6 text-gray-900 mb-4">
                      {previewTemplate.name}
                    </h3>
                    <div className="mt-2 space-y-4">
                      <p className="text-sm text-gray-500">
                        {previewTemplate.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {previewTemplate.categories.map((category) => (
                          <span
                            key={category}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                          >
                            {category}
                          </span>
                        ))}
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Questions</h4>
                        <div className="space-y-4">
                          {previewTemplate.questions.map((question, index) => (
                            <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-start">
                                <span className="flex-shrink-0 bg-indigo-100 text-indigo-700 rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium mr-2">
                                  {index + 1}
                                </span>
                                {getQuestionTypeIcon(question.type)}
                                <div className="ml-3 flex-grow">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900">{question.text}</p>
                                  </div>
                                  <div className="mt-1 flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      question.required 
                                        ? 'bg-red-50 text-red-700' 
                                        : 'bg-gray-100 text-gray-700'
                                    }`}>
                                      {question.required ? 'Required' : 'Optional'}
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      {question.type.charAt(0).toUpperCase() + question.type.slice(1).replace('_', ' ')}
                                    </span>
                                    {question.type === 'rating_scale' && (
                                      <span className="text-xs text-gray-500">
                                        ({question.minValue} - {question.maxValue})
                                      </span>
                                    )}
                                    {question.type === 'number' && question.unit && (
                                      <span className="text-xs text-gray-500">
                                        in {question.unit}
                                      </span>
                                    )}
                                  </div>
                                  {(question.type === 'select' || question.type === 'multiselect' || question.type === 'checkbox') && question.options && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {question.options.map((option) => (
                                        <span key={option} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                          {option}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                    onClick={() => {
                      handleDuplicateTemplate(previewTemplate);
                      setPreviewTemplate(null);
                    }}
                  >
                    Use Template
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setPreviewTemplate(null)}
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 