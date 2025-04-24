'use client';

import { useState } from 'react';
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  DocumentCheckIcon,
  ScaleIcon,
  HeartIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

// Mock forms data
const mockForms = [
  {
    id: 1,
    title: 'Weekly Check-in',
    description: 'Submit your weekly progress update including nutrition, workouts, and overall wellness.',
    dueDate: '2024-04-21',
    status: 'pending',
    type: 'recurring',
    category: 'check-in',
    lastSubmitted: '2024-04-14',
    completionTime: '5-10 min',
    icon: ClipboardDocumentListIcon,
  },
  {
    id: 2,
    title: 'Monthly Progress Photos',
    description: 'Upload your monthly progress photos from the specified poses.',
    dueDate: '2024-04-30',
    status: 'upcoming',
    type: 'recurring',
    category: 'photos',
    lastSubmitted: '2024-03-30',
    completionTime: '10-15 min',
    icon: ChartBarIcon,
  },
  {
    id: 3,
    title: 'Nutrition Assessment',
    description: 'Detailed questionnaire about your current nutrition habits and preferences.',
    dueDate: '2024-04-25',
    status: 'pending',
    type: 'one-time',
    category: 'assessment',
    completionTime: '15-20 min',
    icon: ScaleIcon,
  },
  {
    id: 4,
    title: 'Lifestyle Questionnaire',
    description: 'Help us understand your daily routine, stress levels, and sleep patterns.',
    status: 'completed',
    type: 'one-time',
    category: 'assessment',
    completedDate: '2024-04-01',
    completionTime: '10-15 min',
    icon: HeartIcon,
  }
];

export default function FormsPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Forms' },
    { id: 'check-in', label: 'Check-ins' },
    { id: 'assessment', label: 'Assessments' },
    { id: 'photos', label: 'Progress Photos' },
  ];

  const filteredForms = activeCategory === 'all' 
    ? mockForms 
    : mockForms.filter(form => form.category === activeCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'completed':
        return 'text-green-500 bg-green-500/10';
      case 'upcoming':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Forms</h1>
          <p className="text-gray-400 mt-1">View and complete your required forms</p>
        </div>

        {/* Categories */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Forms Grid */}
        <div className="grid gap-6">
          {filteredForms.map((form) => (
            <div
              key={form.id}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start gap-6">
                <div className="p-3 rounded-lg bg-gray-700">
                  <form.icon className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-white">
                        {form.title}
                      </h3>
                      <p className="text-gray-400 mt-1">
                        {form.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}>
                      {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-6 text-sm">
                    {form.dueDate && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <ClockIcon className="w-4 h-4" />
                        <span>Due {new Date(form.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {form.lastSubmitted && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Last submitted {new Date(form.lastSubmitted).toLocaleDateString()}</span>
                      </div>
                    )}
                    {form.completedDate && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Completed {new Date(form.completedDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-400">
                      <ArrowPathIcon className="w-4 h-4" />
                      <span>{form.completionTime}</span>
                    </div>
                    {form.type === 'recurring' && (
                      <span className="text-blue-400">Recurring</span>
                    )}
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-white transition-colors">
                  <ChevronRightIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredForms.length === 0 && (
          <div className="text-center py-12">
            <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-white">No forms found</h3>
            <p className="mt-1 text-gray-400">There are no forms in this category</p>
          </div>
        )}
      </div>
    </div>
  );
} 