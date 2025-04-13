'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import TemplateDetails from './components/TemplateDetails';
import TemplateDesigner from './components/TemplateDesigner';
import TemplatePreview from './components/TemplatePreview';
import { useAutoSave } from './hooks/useAutoSave';
import { templateService } from './services/templateService';

// Step type definition
type BuilderStep = {
  id: number;
  title: string;
  description: string;
};

const BUILDER_STEPS: BuilderStep[] = [
  {
    id: 1,
    title: 'Template Details',
    description: 'Set the basic information for your template'
  },
  {
    id: 2,
    title: 'Design',
    description: 'Build your template structure'
  },
  {
    id: 3,
    title: 'Logic',
    description: 'Add conditional logic and scoring'
  },
  {
    id: 4,
    title: 'Preview',
    description: 'Review your template'
  },
  {
    id: 5,
    title: 'Settings',
    description: 'Configure template settings'
  }
];

export default function TemplateBuilderV2() {
  const [currentStep, setCurrentStep] = useState(1);
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
    category: '',
    tags: [],
    sections: [],
    settings: {}
  });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      const draft = await templateService.loadDraft();
      if (draft) {
        setTemplateData(draft.data);
        setLastSaved(new Date(draft.lastModified));
      }
    };
    loadDraft();
  }, []);

  // Auto-save functionality
  useAutoSave(
    templateData,
    async (data) => {
      setIsSaving(true);
      try {
        await templateService.saveDraft(data);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to auto-save:', error);
        // You might want to show a toast notification here
      } finally {
        setIsSaving(false);
      }
    },
    2000 // Save after 2 seconds of inactivity
  );

  const handleTemplateDetailsSubmit = (data: {
    name: string;
    description: string;
    category: string;
    tags: string[];
  }) => {
    setTemplateData(prev => ({
      ...prev,
      ...data
    }));
    setCurrentStep(2);
  };

  const handleDesignerSubmit = (data: { sections: any[] }) => {
    setTemplateData(prev => ({
      ...prev,
      sections: data.sections
    }));
    setCurrentStep(3);
  };

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    try {
      await templateService.saveDraft(templateData);
      setLastSaved(new Date());
      // Here you would typically also save the final version
      // await api.post('/api/templates', templateData);
    } catch (error) {
      console.error('Failed to save template:', error);
      // Show error notification
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <TemplateDetails
            initialData={templateData}
            onSave={handleTemplateDetailsSubmit}
          />
        );
      case 2:
        return (
          <TemplateDesigner
            initialData={templateData}
            onSave={handleDesignerSubmit}
          />
        );
      case 4:
        return (
          <TemplatePreview
            template={templateData}
          />
        );
      default:
        return (
          <div className="text-center text-gray-400">
            Step {currentStep} content is under development
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#1C1C1F]">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/coach/templates"
                className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <ChevronLeftIcon className="w-5 h-5" />
                <span>Back to Templates</span>
              </Link>
              <h1 className="text-xl font-semibold text-white">Create New Template</h1>
              {lastSaved && (
                <span className="text-sm text-gray-400">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/coach/check-ins"
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                View Check-ins
              </Link>
              <Link
                href="/client/check-in"
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Test Check-in
              </Link>
              <button 
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setCurrentStep(4)} // Jump to preview step
              >
                Preview
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={isSaving}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-lg transition-colors ${
                  isSaving
                    ? 'opacity-75 cursor-not-allowed'
                    : 'hover:bg-indigo-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between">
          {BUILDER_STEPS.map((step, index) => (
            <div 
              key={step.id}
              className="flex flex-col items-center w-48"
              onClick={() => {
                // Only allow going back to previous steps
                if (step.id < currentStep) {
                  setCurrentStep(step.id);
                }
              }}
              style={{ cursor: step.id < currentStep ? 'pointer' : 'default' }}
            >
              <motion.div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-800 text-gray-400'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: currentStep === step.id ? 1 : 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {step.id}
              </motion.div>
              <div className="mt-2 text-center">
                <div className={`font-medium ${
                  currentStep >= step.id ? 'text-white' : 'text-gray-400'
                }`}>
                  {step.title}
                </div>
                <div className="text-sm text-gray-500">
                  {step.description}
                </div>
              </div>
              {index < BUILDER_STEPS.length - 1 && (
                <div className={`h-0.5 w-full mt-5 ${
                  currentStep > step.id ? 'bg-indigo-600' : 'bg-gray-800'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#2C2C30] rounded-xl p-6 min-h-[600px]">
          {renderStepContent()}
        </div>
      </main>
    </div>
  );
} 