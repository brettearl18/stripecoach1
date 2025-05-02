'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { moduleService, ProgramModule } from '@/lib/services/moduleService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ModuleContentManager from './ModuleContentManager';

export default function ModuleManager() {
  const { user } = useAuth();
  const [modules, setModules] = useState<ProgramModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [selectedModule, setSelectedModule] = useState<ProgramModule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 0,
    duration: 1,
    status: 'draft' as const
  });

  useEffect(() => {
    loadModules();
  }, [searchQuery]);

  const loadModules = async () => {
    try {
      setLoading(true);
      const { modules } = await moduleService.listModules({
        search: searchQuery,
        status: 'published'
      });
      setModules(modules);
    } catch (error) {
      console.error('Error loading modules:', error);
      toast.error('Failed to load modules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) throw new Error('User not authenticated');

      if (selectedModule) {
        const updatedModule = await moduleService.updateModule(selectedModule.id, {
          ...formData,
          metadata: {
            ...selectedModule.metadata,
            lastModifiedBy: user.id
          }
        });
        setModules(modules.map(m => m.id === updatedModule.id ? updatedModule : m));
        toast.success('Module updated successfully');
      } else {
        const newModule = await moduleService.createModule({
          ...formData,
          content: {
            lessons: [],
            tasks: [],
            milestones: []
          },
          metadata: {
            createdBy: user.id,
            lastModifiedBy: user.id,
            version: '1.0.0',
            status: formData.status
          }
        });
        setModules([...modules, newModule]);
        toast.success('Module created successfully');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving module:', error);
      toast.error('Failed to save module');
    }
  };

  const handleDelete = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return;

    try {
      await moduleService.deleteModule(moduleId);
      setModules(modules.filter(m => m.id !== moduleId));
      toast.success('Module deleted successfully');
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    }
  };

  const handleEdit = (module: ProgramModule) => {
    setSelectedModule(module);
    setFormData({
      title: module.title,
      description: module.description,
      order: module.order,
      duration: module.duration,
      status: module.metadata.status
    });
    setActiveTab('edit');
  };

  const handleContentUpdate = (updatedModule: ProgramModule) => {
    setModules(modules.map(m => m.id === updatedModule.id ? updatedModule : m));
    setSelectedModule(updatedModule);
  };

  const resetForm = () => {
    setSelectedModule(null);
    setFormData({
      title: '',
      description: '',
      order: 0,
      duration: 1,
      status: 'draft'
    });
    setActiveTab('list');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Module Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="list">List Modules</TabsTrigger>
              <TabsTrigger value="create">Create Module</TabsTrigger>
              {selectedModule && <TabsTrigger value="edit">Edit Module</TabsTrigger>}
              {selectedModule && <TabsTrigger value="content">Manage Content</TabsTrigger>}
            </TabsList>

            <TabsContent value="list">
              <div className="space-y-4">
                <Input
                  placeholder="Search modules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((module) => (
                      <Card key={module.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold">{module.title}</h3>
                              <p className="text-sm text-gray-500">{module.description}</p>
                              <div className="mt-2 text-sm">
                                <span className="mr-4">Duration: {module.duration} weeks</span>
                                <span>Status: {module.metadata.status}</span>
                              </div>
                            </div>
                            <div className="space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(module)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(module.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="create">
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
                    <label className="block text-sm font-medium mb-1">Order</label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Duration (weeks)</label>
                    <Input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as 'draft' | 'published' | 'archived' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Module</Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="edit">
              {selectedModule && (
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
                      <label className="block text-sm font-medium mb-1">Order</label>
                      <Input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Duration (weeks)</label>
                      <Input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as 'draft' | 'published' | 'archived' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button type="submit">Update Module</Button>
                  </div>
                </form>
              )}
            </TabsContent>

            <TabsContent value="content">
              {selectedModule && (
                <ModuleContentManager
                  module={selectedModule}
                  onUpdate={handleContentUpdate}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 