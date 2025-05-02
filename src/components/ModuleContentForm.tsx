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
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['lessons', 'tasks', 'milestones'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Lessons Tab */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {module.content.lessons?.map((lesson) => (
              <div key={lesson.id} className="flex justify-between items-start p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{lesson.title}</h4>
                  <p className="text-sm text-gray-500">{lesson.description}</p>
                  <div className="mt-1 text-sm">
                    <span className="text-gray-500">Type: {lesson.type}</span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-500">Duration: {lesson.duration} min</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteLesson(lesson.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Add New Lesson</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={currentLesson.title}
                  onChange={(e) => setCurrentLesson(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={currentLesson.description}
                  onChange={(e) => setCurrentLesson(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={currentLesson.type}
                    onChange={(e) => setCurrentLesson(prev => ({ ...prev, type: e.target.value as any }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="text">Text</option>
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input
                    type="number"
                    value={currentLesson.duration}
                    onChange={(e) => setCurrentLesson(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  value={currentLesson.content}
                  onChange={(e) => setCurrentLesson(prev => ({ ...prev, content: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <button
                type="button"
                onClick={handleAddLesson}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {module.content.tasks?.map((task) => (
              <div key={task.id} className="flex justify-between items-start p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{task.title}</h4>
                  <p className="text-sm text-gray-500">{task.description}</p>
                  <div className="mt-1 text-sm">
                    <span className="text-gray-500">Type: {task.type}</span>
                    <span className="mx-2">•</span>
                    <span className="text-gray-500">Status: {task.status}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Add New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={currentTask.title}
                  onChange={(e) => setCurrentTask(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={currentTask.description}
                  onChange={(e) => setCurrentTask(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={currentTask.type}
                  onChange={(e) => setCurrentTask(prev => ({ ...prev, type: e.target.value as any }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="action">Action</option>
                  <option value="reflection">Reflection</option>
                  <option value="assessment">Assessment</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddTask}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {module.content.milestones?.map((milestone) => (
              <div key={milestone.id} className="flex justify-between items-start p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{milestone.title}</h4>
                  <p className="text-sm text-gray-500">{milestone.description}</p>
                  <div className="mt-2">
                    <h5 className="text-sm font-medium text-gray-700">Criteria:</h5>
                    <ul className="mt-1 list-disc list-inside text-sm text-gray-500">
                      {milestone.criteria.map((criterion, index) => (
                        <li key={index}>{criterion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMilestone(milestone.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Add New Milestone</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={currentMilestone.title}
                  onChange={(e) => setCurrentMilestone(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={currentMilestone.description}
                  onChange={(e) => setCurrentMilestone(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Criteria</label>
                <div className="mt-1 space-y-2">
                  {currentMilestone.criteria?.map((criterion, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={criterion}
                        onChange={(e) => {
                          const newCriteria = [...(currentMilestone.criteria || [])];
                          newCriteria[index] = e.target.value;
                          setCurrentMilestone(prev => ({ ...prev, criteria: newCriteria }));
                        }}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newCriteria = [...(currentMilestone.criteria || [])];
                          newCriteria.splice(index, 1);
                          setCurrentMilestone(prev => ({ ...prev, criteria: newCriteria }));
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCurrentMilestone(prev => ({
                      ...prev,
                      criteria: [...(prev.criteria || []), '']
                    }))}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    + Add Criterion
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddMilestone}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 