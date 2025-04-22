'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  PlusIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  DocumentIcon,
  ClipboardDocumentListIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { ContentEditor } from './components/ContentEditor';
import { toast } from 'react-hot-toast';

interface Content {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  scheduledFor?: string;
  lastModified: string;
  author: string;
  tags: string[];
  version: number;
}

const mockContent: Content[] = [
  {
    id: '1',
    title: 'Weight Loss Program Template',
    type: 'template',
    category: 'weight-loss',
    status: 'published',
    lastModified: '2024-03-15T10:30:00Z',
    author: 'John Doe',
    tags: ['weight-loss', 'beginner'],
    version: 1,
  },
  {
    id: '2',
    title: 'Nutrition Guide: Healthy Eating',
    type: 'nutrition',
    category: 'nutrition',
    status: 'draft',
    lastModified: '2024-03-14T15:45:00Z',
    author: 'Jane Smith',
    tags: ['nutrition', 'meal-planning'],
    version: 2,
  },
  {
    id: '3',
    title: 'Strength Training Program',
    type: 'program',
    category: 'strength',
    status: 'scheduled',
    scheduledFor: '2024-03-20T09:00:00Z',
    lastModified: '2024-03-13T11:20:00Z',
    author: 'Mike Johnson',
    tags: ['strength', 'intermediate'],
    version: 1,
  },
];

export default function CMSPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [content, setContent] = useState<Content[]>(mockContent);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'title' | 'lastModified'>('lastModified');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type) {
      setSelectedType(type);
    }
  }, [searchParams]);

  const filteredContent = content.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => item.tags.includes(tag));
    return matchesSearch && matchesType && matchesStatus && matchesTags;
  }).sort((a, b) => {
    if (sortBy === 'title') {
      return sortOrder === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else {
      return sortOrder === 'asc'
        ? new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
        : new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    }
  });

  const handleCreateContent = () => {
    setSelectedContent(null);
    setEditorMode('create');
    setIsEditorOpen(true);
  };

  const handleEditContent = (content: Content) => {
    setSelectedContent(content);
    setEditorMode('edit');
    setIsEditorOpen(true);
  };

  const handleDuplicateContent = (content: Content) => {
    const newContent = {
      ...content,
      id: Date.now().toString(),
      title: `${content.title} (Copy)`,
      status: 'draft',
      lastModified: new Date().toISOString(),
    };
    setContent([...content, newContent]);
    toast.success('Content duplicated successfully');
  };

  const handleDeleteContent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      setContent(content.filter(item => item.id !== id));
      toast.success('Content deleted successfully');
    }
  };

  const handleBulkAction = (action: 'delete' | 'export' | 'duplicate') => {
    // TODO: Implement bulk actions
    toast.success(`Bulk ${action} action triggered`);
  };

  const allTags = Array.from(new Set(content.flatMap(item => item.tags)));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Breadcrumb */}
      <nav className="flex px-4 py-3 bg-white dark:bg-gray-800 shadow">
        <ol className="flex items-center space-x-4">
          <li>
            <div className="flex items-center">
              <a href="/coach/dashboard" className="text-gray-400 hover:text-gray-500">
                Dashboard
              </a>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRightIcon className="h-5 w-5 text-gray-400" />
              <a href="/coach/cms" className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100">
                Content Management
              </a>
            </div>
          </li>
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
              Content Management
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button
              type="button"
              onClick={handleCreateContent}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              New Content
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="sr-only">
                  Search
                </label>
                <input
                  type="search"
                  id="search"
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="template">Templates</option>
                  <option value="program">Programs</option>
                  <option value="resource">Resources</option>
                  <option value="nutrition">Nutrition</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [newSortBy, newSortOrder] = e.target.value.split('-');
                    setSortBy(newSortBy as 'title' | 'lastModified');
                    setSortOrder(newSortOrder as 'asc' | 'desc');
                  }}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="lastModified-desc">Newest First</option>
                  <option value="lastModified-asc">Oldest First</option>
                  <option value="title-asc">Title A-Z</option>
                  <option value="title-desc">Title Z-A</option>
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags(
                      selectedTags.includes(tag)
                        ? selectedTags.filter(t => t !== tag)
                        : [...selectedTags, tag]
                    );
                  }}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredContent.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {item.type === 'template' && <DocumentDuplicateIcon className="h-10 w-10 text-gray-400" />}
                          {item.type === 'program' && <ClipboardDocumentListIcon className="h-10 w-10 text-gray-400" />}
                          {item.type === 'resource' && <DocumentTextIcon className="h-10 w-10 text-gray-400" />}
                          {item.type === 'nutrition' && <DocumentIcon className="h-10 w-10 text-gray-400" />}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.tags.join(', ')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white capitalize">{item.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white capitalize">{item.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        item.status === 'published'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : item.status === 'draft'
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(item.lastModified).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditContent(item)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDuplicateContent(item)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => handleDeleteContent(item.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Content Editor Modal */}
      <ContentEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialData={selectedContent || undefined}
        mode={editorMode}
      />
    </div>
  );
} 