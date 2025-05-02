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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Information</h2>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (weeks)</label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min={1}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <div className="mt-1 flex items-center space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.metadata?.tags?.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Modules</h2>
        
        <div className="space-y-4">
          {formData.structure?.modules?.map((module, index) => (
            <div key={module.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">{module.title}</h3>
                  <p className="text-sm text-gray-500">{module.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    Duration: {module.duration} week(s)
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleModuleReorder(module.id, 'up')}
                    disabled={index === 0}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModuleReorder(module.id, 'down')}
                    disabled={index === formData.structure?.modules?.length - 1}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModuleEdit(module.id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleModuleDelete(module.id)}
                    className="text-red-600 hover:text-red-700"
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

        <div className="p-4 border rounded-lg">
          <h3 className="font-medium mb-4">Add New Module</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={currentModule.title}
                onChange={(e) => setCurrentModule(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={currentModule.description}
                onChange={(e) => setCurrentModule(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (weeks)</label>
              <input
                type="number"
                value={currentModule.duration}
                onChange={(e) => setCurrentModule(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min={1}
              />
            </div>

            <button
              type="button"
              onClick={handleModuleAdd}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Module
            </button>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Settings</h2>
        
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.settings?.autoAssign}
              onChange={(e) => handleInputChange('settings', {
                ...formData.settings,
                autoAssign: e.target.checked
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Auto-assign to new clients</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <h3 className="font-medium">Notifications</h3>
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
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
            ))}
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Progress Tracking</h3>
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
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Template
        </button>
      </div>
    </form>
  );
} 