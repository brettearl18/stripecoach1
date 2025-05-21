'use client';

import { useState } from 'react';
import { ProgramTemplate, ProgramModule, ResourceReference, AssessmentReference } from '@/types/program';
import ModuleContentForm from './ModuleContentForm';

interface ProgramTemplateFormProps {
  initialData?: Partial<ProgramTemplate>;
  onSubmit: (data: Omit<ProgramTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
}

export default function ProgramTemplateForm({ initialData, onSubmit, onCancel }: ProgramTemplateFormProps) {
  const [formData, setFormData] = useState<Partial<ProgramTemplate>>({
    title: '',
    description: '',
    type: '',
    category: '',
    duration: 12,
    structure: {
      modules: [],
      resources: [],
      assessments: []
    },
    settings: {
      autoAssign: false,
      notifications: {
        moduleStart: true,
        taskDue: true,
        milestoneAchieved: true,
        assessmentDue: true,
        weeklyProgress: true
      },
      progressTracking: {
        trackModuleCompletion: true,
        trackAssessments: true,
        trackTasks: true,
        trackMilestones: true,
        requireAllTasks: false
      }
    },
    metadata: {
      createdBy: '',
      lastModifiedBy: '',
      version: '1.0.0',
      tags: [],
      status: 'draft'
    },
    ...initialData
  });

  const [currentModule, setCurrentModule] = useState<Partial<ProgramModule>>({
    title: '',
    description: '',
    order: (formData.structure?.modules?.length || 0) + 1,
    duration: 1,
    content: {
      lessons: [],
      tasks: [],
      milestones: []
    }
  });

  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: [...(prev.metadata?.tags || []), newTag.trim()]
      }
    }));
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: (prev.metadata?.tags || []).filter(tag => tag !== tagToRemove)
      }
    }));
  };

  const handleModuleAdd = () => {
    if (!currentModule.title) return;

    setFormData(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        modules: [
          ...(prev.structure?.modules || []),
          {
            ...currentModule,
            id: `module-${Date.now()}`,
          } as ProgramModule
        ]
      }
    }));

    setCurrentModule({
      title: '',
      description: '',
      order: (formData.structure?.modules?.length || 0) + 2,
      duration: 1,
      content: {
        lessons: [],
        tasks: [],
        milestones: []
      }
    });
  };

  const handleModuleEdit = (moduleId: string) => {
    const module = formData.structure?.modules?.find(m => m.id === moduleId);
    if (module) {
      setCurrentModule(module);
      handleModuleDelete(moduleId);
    }
  };

  const handleModuleDelete = (moduleId: string) => {
    setFormData(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        modules: (prev.structure?.modules || []).filter(m => m.id !== moduleId)
      }
    }));
  };

  const handleModuleReorder = (moduleId: string, direction: 'up' | 'down') => {
    const modules = [...(formData.structure?.modules || [])];
    const index = modules.findIndex(m => m.id === moduleId);
    
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === modules.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [modules[index], modules[newIndex]] = [modules[newIndex], modules[index]];

    setFormData(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        modules: modules.map((m, i) => ({ ...m, order: i + 1 }))
      }
    }));
  };

  const handleResourceAdd = (resource: Partial<ResourceReference>) => {
    setFormData(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        resources: [
          ...(prev.structure?.resources || []),
          {
            ...resource,
            id: `resource-${Date.now()}`,
          } as ResourceReference
        ]
      }
    }));
  };

  const handleAssessmentAdd = (assessment: Partial<AssessmentReference>) => {
    setFormData(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        assessments: [
          ...(prev.structure?.assessments || []),
          {
            ...assessment,
            id: `assessment-${Date.now()}`,
          } as AssessmentReference
        ]
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    if (!formData.structure?.modules?.length) {
      alert('Please add at least one module');
      return;
    }

    try {
      await onSubmit(formData as Omit<ProgramTemplate, 'id' | 'createdAt' | 'updatedAt'>);
    } catch (error) {
      console.error('Error submitting template:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl mx-auto">
      {/* Basic Information */}
      <div className="space-y-6 border-b border-gray-700 pb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Basic Information</h2>
        <div className="mb-6">
          <label htmlFor="title" className="block text-gray-200 text-base font-medium mb-2">Title</label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full h-12 px-4 py-3 bg-gray-900 text-gray-200 placeholder-gray-400 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="Enter program title"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-200 text-base font-medium mb-2">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 text-gray-200 placeholder-gray-400 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            rows={3}
            placeholder="Describe the program"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="type" className="block text-gray-200 text-base font-medium mb-2">Type</label>
            <input
              id="type"
              type="text"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full h-12 px-4 py-3 bg-gray-900 text-gray-200 placeholder-gray-400 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="e.g. Weight Loss"
              required
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-gray-200 text-base font-medium mb-2">Category</label>
            <input
              id="category"
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full h-12 px-4 py-3 bg-gray-900 text-gray-200 placeholder-gray-400 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="e.g. Fitness"
              required
            />
          </div>
        </div>
        <div className="mb-6">
          <label htmlFor="duration" className="block text-gray-200 text-base font-medium mb-2">Duration (weeks)</label>
          <input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
            className="w-full h-12 px-4 py-3 bg-gray-900 text-gray-200 placeholder-gray-400 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            min={1}
            placeholder="8"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="tags" className="block text-gray-200 text-base font-medium mb-2">Tags</label>
          <div className="flex items-center space-x-2">
            <input
              id="tags"
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="w-full h-12 px-4 py-3 bg-gray-900 text-gray-200 placeholder-gray-400 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-base font-medium flex items-center"
            >
              +
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.metadata?.tags?.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-6 border-b border-gray-700 pb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Modules</h2>
        <div className="space-y-6">
          {formData.structure?.modules?.map((module, index) => (
            <div key={module.id} className="p-6 bg-gray-900 border border-gray-700 rounded-lg shadow hover:bg-gray-800 transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-100">{module.title}</h3>
                  <p className="text-sm text-gray-400">{module.description}</p>
                  <div className="mt-2 text-sm text-gray-400">
                    Duration: {module.duration} week(s)
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleModuleReorder(module.id, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-200 disabled:opacity-50 px-2 py-1 rounded"
                    aria-label="Move module up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModuleReorder(module.id, 'down')}
                    disabled={index === formData.structure?.modules?.length - 1}
                    className="text-gray-400 hover:text-gray-200 disabled:opacity-50 px-2 py-1 rounded"
                    aria-label="Move module down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModuleEdit(module.id)}
                    className="text-blue-400 hover:text-blue-600 px-2 py-1 rounded"
                    aria-label="Edit module"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModuleDelete(module.id)}
                    className="text-red-400 hover:text-red-600 px-2 py-1 rounded"
                    aria-label="Delete module"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <ModuleContentForm
                module={module}
                onUpdate={(updatedModule) => {
                  const updatedModules = formData.structure?.modules?.map(m =>
                    m.id === module.id ? updatedModule : m
                  ) || [];
                  setFormData(prev => ({
                    ...prev,
                    structure: {
                      ...prev.structure,
                      modules: updatedModules
                    }
                  }));
                }}
              />
            </div>
          ))}
        </div>
        <div className="p-6 bg-gray-900 border border-gray-700 rounded-lg shadow mt-6">
          <h3 className="font-semibold text-lg text-gray-100 mb-4">Add New Module</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="module-title" className="block text-gray-200 text-base font-medium mb-2">Title</label>
              <input
                id="module-title"
                type="text"
                value={currentModule.title}
                onChange={(e) => setCurrentModule(prev => ({ ...prev, title: e.target.value }))}
                className="w-full h-12 px-4 py-3 bg-gray-900 text-gray-200 placeholder-gray-400 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="Module title"
              />
            </div>
            <div>
              <label htmlFor="module-description" className="block text-gray-200 text-base font-medium mb-2">Description</label>
              <textarea
                id="module-description"
                value={currentModule.description}
                onChange={(e) => setCurrentModule(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-900 text-gray-200 placeholder-gray-400 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                rows={2}
                placeholder="Module description"
              />
            </div>
            <div>
              <label htmlFor="module-duration" className="block text-gray-200 text-base font-medium mb-2">Duration (weeks)</label>
              <input
                id="module-duration"
                type="number"
                value={currentModule.duration}
                onChange={(e) => setCurrentModule(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full h-12 px-4 py-3 bg-gray-900 text-gray-200 placeholder-gray-400 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                min={1}
                placeholder="2"
              />
            </div>
            <button
              type="button"
              onClick={handleModuleAdd}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-base font-medium flex items-center"
            >
              + Add Module
            </button>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Settings</h2>
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.settings?.autoAssign}
              onChange={(e) => handleInputChange('settings', {
                ...formData.settings,
                autoAssign: e.target.checked
              })}
              className="rounded border-gray-700 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-base font-medium text-gray-200">Auto-assign to new clients</span>
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-200 mb-2">Notifications</h3>
            {Object.entries(formData.settings?.notifications || {}).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleInputChange('settings', {
                    ...formData.settings,
                    notifications: {
                      ...formData.settings?.notifications,
                      [key]: e.target.checked
                    }
                  })}
                  className="rounded border-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-base text-gray-200">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
            ))}
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-200 mb-2">Progress Tracking</h3>
            {Object.entries(formData.settings?.progressTracking || {}).map(([key, value]) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleInputChange('settings', {
                    ...formData.settings,
                    progressTracking: {
                      ...formData.settings?.progressTracking,
                      [key]: e.target.checked
                    }
                  })}
                  className="rounded border-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-base text-gray-200">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-700 rounded-lg hover:bg-gray-800 text-gray-200 text-base font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base font-medium transition-colors"
        >
          Save Template
        </button>
      </div>
    </form>
  );
} 