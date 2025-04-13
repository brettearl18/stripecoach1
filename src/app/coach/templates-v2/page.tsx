'use client';

import { useState } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import TemplateDetails from './components/TemplateDetails';
import TemplateDesigner from './components/TemplateDesigner';
import TemplateLogic from './components/TemplateLogic';
import TemplatePreview from './components/TemplatePreview';
import TemplateSettings from './components/TemplateSettings';
import TemplateAllocation from './components/TemplateAllocation';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';

const STEPS = [
  { id: 'details', label: 'Details', icon: 'D' },
  { id: 'design', label: 'Design', icon: 'De' },
  { id: 'logic', label: 'Logic', icon: 'L' },
  { id: 'preview', label: 'Preview', icon: 'P' },
  { id: 'settings', label: 'Settings', icon: 'S' },
  { id: 'allocate', label: 'Allocate', icon: 'A' }
];

const CATEGORIES = [
  {
    name: 'Wellness',
    subcategories: ['Mental Health', 'Stress Management', 'Work-Life Balance', 'Mindfulness']
  },
  {
    name: 'Fitness',
    subcategories: ['Strength Training', 'Cardio', 'Flexibility', 'Sports Performance']
  },
  {
    name: 'Nutrition',
    subcategories: ['Meal Planning', 'Weight Management', 'Special Diets', 'Supplements']
  },
  {
    name: 'Mental Health',
    subcategories: ['Anxiety', 'Depression', 'Stress', 'Personal Growth']
  },
  {
    name: 'Business',
    subcategories: ['Leadership', 'Productivity', 'Team Management', 'Strategy']
  },
  {
    name: 'Career',
    subcategories: ['Professional Development', 'Job Search', 'Skills Development', 'Career Transition']
  },
  {
    name: 'Life',
    subcategories: ['Personal Goals', 'Habits', 'Time Management', 'Personal Finance']
  },
  {
    name: 'Relationship',
    subcategories: ['Communication', 'Dating', 'Marriage', 'Family']
  },
  {
    name: 'Other',
    subcategories: ['Custom']
  }
];

export default function TemplateBuilderV2() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const [currentStep, setCurrentStep] = useState('details');
  const [templateData, setTemplateData] = useState({
    details: {
      title: '',
      description: '',
      categories: [] as string[],
      subcategories: [] as string[]
    },
    sections: [] as Section[],
    logic: {
      rules: []
    },
    settings: {
      notifications: true,
      reminders: true,
      frequency: {
        type: 'weekly' as const,
        value: undefined
      },
      checkInWindow: 7,
      customFrequency: null,
      autoAssign: false
    },
    allocations: [] as ClientAllocation[]
  });

  const handleDetailsSubmit = (data: any) => {
    // Create sections based on selected categories and their subcategories
    const sections = data.categories.flatMap(categoryName => {
      const category = CATEGORIES.find(c => c.name === categoryName);
      if (!category) return [];
      
      // Create a main section for the category
      const mainSection = {
        id: `${categoryName.toLowerCase().replace(/\s+/g, '-')}-main`,
        title: categoryName,
        description: `Main section for ${categoryName}`,
        questions: []
      };

      // Create subsections for each subcategory
      const subsections = category.subcategories.map(subcategory => ({
        id: `${categoryName.toLowerCase().replace(/\s+/g, '-')}-${subcategory.toLowerCase().replace(/\s+/g, '-')}`,
        title: subcategory,
        description: `${subcategory} related questions for ${categoryName}`,
        questions: []
      }));

      return [mainSection, ...subsections];
    });

    setTemplateData(prev => ({
      ...prev,
      details: data,
      sections
    }));
    setCurrentStep('design');
  };

  const handleDesignSubmit = (data: any) => {
    setTemplateData(prev => ({ ...prev, sections: data.sections }));
    setCurrentStep('logic');
  };

  const handleLogicSubmit = (data: any) => {
    setTemplateData(prev => ({ ...prev, logic: data }));
    setCurrentStep('preview');
  };

  const handlePreviewSubmit = () => {
    setCurrentStep('settings');
  };

  const handleSettingsSubmit = (settings: any) => {
    setTemplateData(prev => ({
      ...prev,
      settings
    }));
    setCurrentStep('allocate');
  };

  const handleAllocationSubmit = async (allocations: ClientAllocation[]) => {
    try {
      // Check if user is authenticated
      if (!session?.user) {
        toast.error('Please sign in to save the template');
        router.push('/auth/signin');
        return;
      }

      setTemplateData(prev => ({
        ...prev,
        allocations
      }));

      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...templateData,
          allocations
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save template');
      }

      // Show success message
      toast.success('Template saved successfully!');

      // Redirect to templates list
      router.push('/coach/templates-v2');
    } catch (error: any) {
      console.error('Error saving template:', error);
      if (error.message === 'Unauthorized') {
        toast.error('Your session has expired. Please sign in again.');
        router.push('/auth/signin');
      } else {
        toast.error(error.message || 'Failed to save template. Please try again.');
      }
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'details':
        return (
          <TemplateDetails
            initialData={templateData.details}
            onSave={handleDetailsSubmit}
          />
        );
      case 'design':
        return (
          <TemplateDesigner
            initialData={{ sections: templateData.sections }}
            onSave={handleDesignSubmit}
          />
        );
      case 'logic':
        return (
          <TemplateLogic
            initialData={{
              sections: templateData.sections,
              ...templateData.logic
            }}
            onSave={handleLogicSubmit}
          />
        );
      case 'preview':
        return (
          <TemplatePreview
            sections={templateData.sections}
            onSave={handlePreviewSubmit}
          />
        );
      case 'settings':
        return (
          <TemplateSettings
            initialData={templateData.settings}
            onSave={handleSettingsSubmit}
          />
        );
      case 'allocate':
        return (
          <TemplateAllocation
            onSave={handleAllocationSubmit}
            onBack={() => setCurrentStep('settings')}
            defaultSettings={{
              frequency: templateData.settings.frequency,
              checkInWindow: templateData.settings.checkInWindow
            }}
          />
        );
      default:
        return null;
    }
  };

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#141414] p-8 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#1C1C1F',
            color: '#fff',
            border: '1px solid #2C2C30',
          },
          success: {
            iconTheme: {
              primary: '#4F46E5',
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
      
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center justify-between">
            <Link
              href="/coach/templates"
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-2" />
              Back to Templates
            </Link>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Save Template
            </button>
          </nav>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="border-b border-gray-800 bg-[#1C1C1F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col items-center"
              >
                <div className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                      transition-all duration-200
                      ${currentStep === step.id
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2 ring-offset-[#1C1C1F]'
                        : step.id < currentStep
                        ? 'bg-indigo-600/20 text-indigo-400 border-2 border-indigo-600'
                        : 'bg-gray-800 text-gray-400 border-2 border-gray-700'
                      }
                    `}
                  >
                    {step.icon}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`
                        w-24 h-[2px] mx-2
                        ${step.id < currentStep
                          ? 'bg-indigo-600'
                          : 'bg-gray-700'
                        }
                      `}
                    />
                  )}
                </div>
                <span
                  className={`
                    mt-2 text-sm font-medium
                    ${currentStep === step.id
                      ? 'text-white'
                      : step.id < currentStep
                      ? 'text-indigo-400'
                      : 'text-gray-500'
                    }
                  `}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
} 