'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { moduleService, ProgramModule, Lesson, Task, Milestone } from '@/lib/services/moduleService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface ModuleContentManagerProps {
  module: ProgramModule;
  onUpdate: (updatedModule: ProgramModule) => void;
}

export default function ModuleContentManager({ module, onUpdate }: ModuleContentManagerProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('lessons');
  const [selectedItem, setSelectedItem] = useState<Lesson | Task | Milestone | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    content: '',
    duration: 0,
    order: 0,
    status: 'pending' as const,
    criteria: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) throw new Error('User not authenticated');

      let updatedModule: ProgramModule;

      switch (activeTab) {
        case 'lessons':
          const lesson: Omit<Lesson, 'id'> = {
            title: formData.title,
            description: formData.description,
            type: formData.type as 'text' | 'video' | 'quiz' | 'assignment',
            content: formData.content,
            duration: formData.duration,
            order: formData.order,
            resources: []
          };
          updatedModule = await moduleService.addLesson(module.id, lesson);
          break;

        case 'tasks':
          const task: Omit<Task, 'id'> = {
            title: formData.title,
            description: formData.description,
            type: formData.type as 'action' | 'reflection' | 'assessment',
            status: formData.status,
            order: formData.order
          };
          updatedModule = await moduleService.addTask(module.id, task);
          break;

        case 'milestones':
          const milestone: Omit<Milestone, 'id'> = {
            title: formData.title,
            description: formData.description,
            criteria: formData.criteria,
            order: formData.order
          };
          updatedModule = await moduleService.addMilestone(module.id, milestone);
          break;

        default:
          throw new Error('Invalid content type');
      }

      onUpdate(updatedModule);
      resetForm();
      toast.success('Content added successfully');
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    }
  };

  const resetForm = () => {
    setSelectedItem(null);
    setFormData({
      title: '',
      description: '',
      type: '',
      content: '',
      duration: 0,
      order: 0,
      status: 'pending',
      criteria: []
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Module Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
            </TabsList>

            <TabsContent value="lessons">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {module.content.lessons.map((lesson) => (
                    <Card key={lesson.id}>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold">{lesson.title}</h3>
                        <p className="text-sm text-gray-500">{lesson.description}</p>
                        <div className="mt-2 text-sm">
                          <span className="mr-4">Type: {lesson.type}</span>
                          <span>Duration: {lesson.duration} minutes</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                      <Input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Content</label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Order</label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Lesson</Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="tasks">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {module.content.tasks.map((task) => (
                    <Card key={task.id}>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        <p className="text-sm text-gray-500">{task.description}</p>
                        <div className="mt-2 text-sm">
                          <span className="mr-4">Type: {task.type}</span>
                          <span>Status: {task.status}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="action">Action</SelectItem>
                          <SelectItem value="reflection">Reflection</SelectItem>
                          <SelectItem value="assessment">Assessment</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Status</label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value as 'pending' | 'in-progress' | 'completed' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Order</label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Task</Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="milestones">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {module.content.milestones.map((milestone) => (
                    <Card key={milestone.id}>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-semibold">{milestone.title}</h3>
                        <p className="text-sm text-gray-500">{milestone.description}</p>
                        <div className="mt-2">
                          <h4 className="text-sm font-medium">Criteria:</h4>
                          <ul className="list-disc list-inside text-sm text-gray-500">
                            {milestone.criteria.map((criterion, index) => (
                              <li key={index}>{criterion}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Criteria</label>
                    <Textarea
                      value={formData.criteria.join('\n')}
                      onChange={(e) => setFormData({ ...formData, criteria: e.target.value.split('\n').filter(Boolean) })}
                      placeholder="Enter each criterion on a new line"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Order</label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Milestone</Button>
                  </div>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 