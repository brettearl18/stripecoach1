'use client';

import { useState } from 'react';
import { ProgramModule, Lesson, Task, Milestone } from '@/types/program';

interface ModuleContentFormProps {
  module: ProgramModule;
  onUpdate: (updatedModule: ProgramModule) => void;
}

export default function ModuleContentForm({ module, onUpdate }: ModuleContentFormProps) {
  const [activeTab, setActiveTab] = useState<'lessons' | 'tasks' | 'milestones'>('lessons');
  const [currentLesson, setCurrentLesson] = useState<Partial<Lesson>>({
    title: '',
    description: '',
    type: 'text',
    content: '',
    duration: 30,
    order: (module.content.lessons?.length || 0) + 1
  });
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    type: 'action',
    status: 'pending',
    order: (module.content.tasks?.length || 0) + 1
  });
  const [currentMilestone, setCurrentMilestone] = useState<Partial<Milestone>>({
    title: '',
    description: '',
    criteria: [],
    order: (module.content.milestones?.length || 0) + 1
  });

  const handleAddLesson = () => {
    if (!currentLesson.title) return;

    const updatedModule = {
      ...module,
      content: {
        ...module.content,
        lessons: [
          ...(module.content.lessons || []),
          {
            ...currentLesson,
            id: `lesson-${Date.now()}`
          } as Lesson
        ]
      }
    };

    onUpdate(updatedModule);
    setCurrentLesson({
      title: '',
      description: '',
      type: 'text',
      content: '',
      duration: 30,
      order: (updatedModule.content.lessons?.length || 0) + 1
    });
  };

  const handleAddTask = () => {
    if (!currentTask.title) return;

    const updatedModule = {
      ...module,
      content: {
        ...module.content,
        tasks: [
          ...(module.content.tasks || []),
          {
            ...currentTask,
            id: `task-${Date.now()}`
          } as Task
        ]
      }
    };

    onUpdate(updatedModule);
    setCurrentTask({
      title: '',
      description: '',
      type: 'action',
      status: 'pending',
      order: (updatedModule.content.tasks?.length || 0) + 1
    });
  };

  const handleAddMilestone = () => {
    if (!currentMilestone.title) return;

    const updatedModule = {
      ...module,
      content: {
        ...module.content,
        milestones: [
          ...(module.content.milestones || []),
          {
            ...currentMilestone,
            id: `milestone-${Date.now()}`
          } as Milestone
        ]
      }
    };

    onUpdate(updatedModule);
    setCurrentMilestone({
      title: '',
      description: '',
      criteria: [],
      order: (updatedModule.content.milestones?.length || 0) + 1
    });
  };

  const handleDeleteLesson = (lessonId: string) => {
    onUpdate({
      ...module,
      content: {
        ...module.content,
        lessons: module.content.lessons.filter(l => l.id !== lessonId)
      }
    });
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdate({
      ...module,
      content: {
        ...module.content,
        tasks: module.content.tasks.filter(t => t.id !== taskId)
      }
    });
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    onUpdate({
      ...module,
      content: {
        ...module.content,
        milestones: module.content.milestones.filter(m => m.id !== milestoneId)
      }
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-lg text-gray-100 mb-4">Module Content</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="lesson-title" className="block text-gray-200 text-base font-medium mb-2">Lesson Title</label>
          <input
            id="lesson-title"
            type="text"
            value={currentLesson.title}
            onChange={(e) => setCurrentLesson(prev => ({ ...prev, title: e.target.value }))}
            className="w-full h-12 px-4 py-3 bg-gray-900 text-gray-200 placeholder-gray-400 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            placeholder="Enter lesson title"
          />
        </div>
        <div>
          <label htmlFor="lesson-description" className="block text-gray-200 text-base font-medium mb-2">Lesson Description</label>
          <textarea
            id="lesson-description"
            value={currentLesson.description}
            onChange={(e) => setCurrentLesson(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-900 text-gray-200 placeholder-gray-400 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            rows={3}
            placeholder="Describe the lesson"
          />
        </div>
        <button
          type="button"
          onClick={handleAddLesson}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-base font-medium flex items-center"
        >
          + Add Lesson
        </button>
      </div>
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-200 mb-2">Tasks</h4>
        {module.content.tasks.map((task, index) => (
          <div key={index} className="p-4 bg-gray-900 border border-gray-700 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-medium text-gray-100">{task.title}</h5>
                <p className="text-sm text-gray-400">{task.description}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteTask(task.id)}
                className="text-red-400 hover:text-red-600 px-2 py-1 rounded"
                aria-label="Remove task"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddTask}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-base font-medium flex items-center"
        >
          + Add Task
        </button>
      </div>
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-200 mb-2">Milestones</h4>
        {module.content.milestones.map((milestone, index) => (
          <div key={index} className="p-4 bg-gray-900 border border-gray-700 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-medium text-gray-100">{milestone.title}</h5>
                <p className="text-sm text-gray-400">{milestone.description}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteMilestone(milestone.id)}
                className="text-red-400 hover:text-red-600 px-2 py-1 rounded"
                aria-label="Remove milestone"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddMilestone}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors text-base font-medium flex items-center"
        >
          + Add Milestone
        </button>
      </div>
    </div>
  );
} 