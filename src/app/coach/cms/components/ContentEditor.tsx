'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import {
  XMarkIcon,
  PhotoIcon,
  DocumentIcon,
  CalendarIcon,
  ChevronUpDownIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamic import of the rich text editor to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface ContentEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    id?: string;
    title?: string;
    type?: string;
    category?: string;
    content?: string;
    status?: string;
    scheduledFor?: string;
    tags?: string[];
  };
  mode: 'create' | 'edit';
}

const contentTypes = [
  { id: 'template', name: 'Template' },
  { id: 'program', name: 'Program' },
  { id: 'resource', name: 'Resource' },
  { id: 'nutrition', name: 'Nutrition' },
];

const categories = [
  { id: 'weight-loss', name: 'Weight Loss' },
  { id: 'strength', name: 'Strength Training' },
  { id: 'nutrition', name: 'Nutrition' },
  { id: 'wellness', name: 'Wellness' },
  { id: 'education', name: 'Education' },
];

const statuses = [
  { id: 'draft', name: 'Draft' },
  { id: 'published', name: 'Published' },
  { id: 'scheduled', name: 'Scheduled' },
];

export function ContentEditor({
  isOpen,
  onClose,
  initialData,
  mode,
}: ContentEditorProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState(contentTypes[0]);
  const [category, setCategory] = useState(categories[0]);
  const [content, setContent] = useState(initialData?.content || '');
  const [status, setStatus] = useState(statuses[0]);
  const [scheduledFor, setScheduledFor] = useState(initialData?.scheduledFor || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTab, setSelectedTab] = useState('content');
  const [attachments, setAttachments] = useState<File[]>([]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setType(contentTypes.find(t => t.id === initialData.type) || contentTypes[0]);
      setCategory(categories.find(c => c.id === initialData.category) || categories[0]);
      setContent(initialData.content || '');
      setStatus(statuses.find(s => s.id === initialData.status) || statuses[0]);
      setScheduledFor(initialData.scheduledFor || '');
      setTags(initialData.tags || []);
    }
  }, [initialData]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Implement actual save logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(mode === 'create' ? 'Content created successfully' : 'Content updated successfully');
      setIsDirty(false);
      onClose();
    } catch (error) {
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
      setIsDirty(true);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    setIsDirty(true);
  };

  const handleAttachmentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachments([...attachments, ...Array.from(files)]);
      setIsDirty(true);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {
        if (isDirty) {
          if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
            onClose();
          }
        } else {
          onClose();
        }
      }}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-4">
                      {mode === 'create' ? 'Create New Content' : 'Edit Content'}
                    </Dialog.Title>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                      <nav className="-mb-px flex space-x-8">
                        <button
                          onClick={() => setSelectedTab('content')}
                          className={`${
                            selectedTab === 'content'
                              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400'
                          } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                        >
                          Content
                        </button>
                        <button
                          onClick={() => setSelectedTab('settings')}
                          className={`${
                            selectedTab === 'settings'
                              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400'
                          } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                        >
                          Settings
                        </button>
                        <button
                          onClick={() => setSelectedTab('attachments')}
                          className={`${
                            selectedTab === 'attachments'
                              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400'
                          } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                        >
                          Attachments
                        </button>
                      </nav>
                    </div>

                    {selectedTab === 'content' && (
                      <div className="space-y-4">
                        {/* Title */}
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Title
                          </label>
                          <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => {
                              setTitle(e.target.value);
                              setIsDirty(true);
                            }}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                            placeholder="Enter title"
                          />
                        </div>

                        {/* Rich Text Editor */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Content
                          </label>
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactQuill
                              theme="snow"
                              value={content}
                              onChange={(value) => {
                                setContent(value);
                                setIsDirty(true);
                              }}
                              modules={{
                                toolbar: [
                                  [{ header: [1, 2, 3, false] }],
                                  ['bold', 'italic', 'underline', 'strike'],
                                  [{ list: 'ordered' }, { list: 'bullet' }],
                                  ['link', 'image'],
                                  ['clean'],
                                ],
                              }}
                              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white min-h-[200px]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTab === 'settings' && (
                      <div className="space-y-4">
                        {/* Type */}
                        <Listbox value={type} onChange={(value) => {
                          setType(value);
                          setIsDirty(true);
                        }}>
                          <div className="relative mt-1">
                            <Listbox.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Type
                            </Listbox.Label>
                            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                              <span className="block truncate">{type.name}</span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </span>
                            </Listbox.Button>
                            <Transition
                              as={Fragment}
                              leave="transition ease-in duration-100"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                            >
                              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {contentTypes.map((type) => (
                                  <Listbox.Option
                                    key={type.id}
                                    value={type}
                                    className={({ active }) =>
                                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                        active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-white'
                                      }`
                                    }
                                  >
                                    {({ selected, active }) => (
                                      <>
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                          {type.name}
                                        </span>
                                        {selected ? (
                                          <span
                                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                              active ? 'text-white' : 'text-indigo-600'
                                            }`}
                                          >
                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                          </span>
                                        ) : null}
                                      </>
                                    )}
                                  </Listbox.Option>
                                ))}
                              </Listbox.Options>
                            </Transition>
                          </div>
                        </Listbox>

                        {/* Category */}
                        <Listbox value={category} onChange={(value) => {
                          setCategory(value);
                          setIsDirty(true);
                        }}>
                          <div className="relative mt-1">
                            <Listbox.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Category
                            </Listbox.Label>
                            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                              <span className="block truncate">{category.name}</span>
                              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                              </span>
                            </Listbox.Button>
                            <Transition
                              as={Fragment}
                              leave="transition ease-in duration-100"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                            >
                              <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                {categories.map((category) => (
                                  <Listbox.Option
                                    key={category.id}
                                    value={category}
                                    className={({ active }) =>
                                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                        active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-white'
                                      }`
                                    }
                                  >
                                    {({ selected, active }) => (
                                      <>
                                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                          {category.name}
                                        </span>
                                        {selected ? (
                                          <span
                                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                              active ? 'text-white' : 'text-indigo-600'
                                            }`}
                                          >
                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                          </span>
                                        ) : null}
                                      </>
                                    )}
                                  </Listbox.Option>
                                ))}
                              </Listbox.Options>
                            </Transition>
                          </div>
                        </Listbox>

                        {/* Status and Scheduling */}
                        <div className="space-y-4">
                          <Listbox value={status} onChange={(value) => {
                            setStatus(value);
                            setIsDirty(true);
                          }}>
                            <div className="relative mt-1">
                              <Listbox.Label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Status
                              </Listbox.Label>
                              <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
                                <span className="block truncate">{status.name}</span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </span>
                              </Listbox.Button>
                              <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  {statuses.map((status) => (
                                    <Listbox.Option
                                      key={status.id}
                                      value={status}
                                      className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                          active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-white'
                                        }`
                                      }
                                    >
                                      {({ selected, active }) => (
                                        <>
                                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                            {status.name}
                                          </span>
                                          {selected ? (
                                            <span
                                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                active ? 'text-white' : 'text-indigo-600'
                                              }`}
                                            >
                                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>

                          {status.id === 'scheduled' && (
                            <div>
                              <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Schedule Date
                              </label>
                              <input
                                type="datetime-local"
                                id="scheduledFor"
                                value={scheduledFor}
                                onChange={(e) => {
                                  setScheduledFor(e.target.value);
                                  setIsDirty(true);
                                }}
                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                              />
                            </div>
                          )}
                        </div>

                        {/* Tags */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tags
                          </label>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900 py-1 pl-3 pr-2 text-sm font-medium text-indigo-700 dark:text-indigo-200"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
                                >
                                  <span className="sr-only">Remove tag</span>
                                  <XMarkIcon className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="mt-2 flex">
                            <input
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddTag();
                                }
                              }}
                              className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                              placeholder="Add a tag"
                            />
                            <button
                              type="button"
                              onClick={handleAddTag}
                              className="ml-2 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedTab === 'attachments' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                          >
                            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 px-6 pt-5 pb-6">
                              <div className="space-y-1 text-center">
                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                  <span>Upload files</span>
                                  <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    multiple
                                    onChange={handleAttachmentUpload}
                                  />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  PNG, JPG, GIF up to 10MB
                                </p>
                              </div>
                            </div>
                          </label>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Attached Files
                          </h4>
                          <ul className="mt-2 divide-y divide-gray-200 dark:divide-gray-700">
                            {attachments.map((file, index) => (
                              <li key={index} className="flex items-center justify-between py-3">
                                <div className="flex items-center">
                                  <DocumentIcon className="h-5 w-5 text-gray-400" />
                                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                    {file.name}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAttachment(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-base font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 