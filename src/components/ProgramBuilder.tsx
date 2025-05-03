import React, { useState } from 'react';
import { ProgramTemplate } from '../types/program';

interface ProgramBuilderProps {
  onSubmit: (program: ProgramTemplate) => void;
  onCancel: () => void;
}

export default function ProgramBuilder({ onSubmit, onCancel }: ProgramBuilderProps) {
  const [program, setProgram] = useState<Partial<ProgramTemplate>>({
    title: '',
    description: '',
    type: '',
    category: 'fitness',
    duration: 8,
    structure: {
      modules: [],
      resources: [],
      assessments: []
    },
    settings: {
      autoAssign: true,
      notifications: {
        moduleStart: true,
        taskDue: true,
        milestoneAchieved: true,
        assessmentDue: false,
        weeklyProgress: true
      },
      progressTracking: {
        trackModuleCompletion: true,
        trackAssessments: false,
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
    }
  });

  const [currentModule, setCurrentModule] = useState({
    title: '',
    description: '',
    order: 1,
    duration: 2,
    content: {
      lessons: [],
      tasks: [],
      milestones: []
    }
  });

  const handleInputChange = (field: string, value: any) => {
    setProgram(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleModuleChange = (field: string, value: any) => {
    setCurrentModule(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddModule = () => {
    if (!currentModule.title) return;

    setProgram(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        modules: [
          ...(prev.structure?.modules || []),
          {
            id: `module-${Date.now()}`,
            ...currentModule
          }
        ]
      }
    }));

    setCurrentModule({
      title: '',
      description: '',
      order: (program.structure?.modules?.length || 0) + 1,
      duration: 2,
      content: {
        lessons: [],
        tasks: [],
        milestones: []
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!program.title || !program.type || !program.structure?.modules?.length) {
      return;
    }

    onSubmit({
      ...program,
      id: `program-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    } as ProgramTemplate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Program Info */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Program Details</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={program.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={program.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={program.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select a type</option>
            <option value="weight-loss">Weight Loss</option>
            <option value="muscle-gain">Muscle Gain</option>
            <option value="general-fitness">General Fitness</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (weeks)</label>
          <input
            type="number"
            value={program.duration}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min={1}
            max={52}
            required
          />
        </div>
      </div>

      {/* Module Builder */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Add Module</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">Module Title</label>
          <input
            type="text"
            value={currentModule.title}
            onChange={(e) => handleModuleChange('title', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Module Description</label>
          <textarea
            value={currentModule.description}
            onChange={(e) => handleModuleChange('description', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (weeks)</label>
          <input
            type="number"
            value={currentModule.duration}
            onChange={(e) => handleModuleChange('duration', parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min={1}
            max={program.duration || 8}
          />
        </div>
        <button
          type="button"
          onClick={handleAddModule}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Add Module
        </button>
      </div>

      {/* Module List */}
      {program.structure?.modules?.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Modules</h2>
          <div className="space-y-4">
            {program.structure.modules.map((module, index) => (
              <div key={module.id} className="border rounded-lg p-4">
                <h3 className="font-medium">{module.title}</h3>
                <p className="text-sm text-gray-600">{module.description}</p>
                <p className="text-sm text-gray-500">Duration: {module.duration} weeks</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
          Create Program
        </button>
      </div>
    </form>
  );
} 