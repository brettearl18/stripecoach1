'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { roleTemplateService } from '@/lib/services/roleTemplateService';
import { RoleTemplate, RoleHierarchy } from '@/types/role';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function RoleTemplatesPage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<RoleTemplate[]>([]);
  const [hierarchies, setHierarchies] = useState<RoleHierarchy[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('templates');

  // Template form state
  const [templateForm, setTemplateForm] = useState<Partial<RoleTemplate>>({
    name: '',
    description: '',
    permissions: {
      clientManagement: false,
      resourceCreation: false,
      analyticsAccess: false,
      teamManagement: false,
      billingAccess: false,
      settingsAccess: false,
      reportGeneration: false,
      userManagement: false
    },
    settings: {
      maxClients: 0,
      featureAccess: [],
      notificationPreferences: {},
      dataAccess: {
        canViewAllClients: false,
        canViewAllCoaches: false,
        canViewAnalytics: false,
        canViewBilling: false
      }
    }
  });

  // Hierarchy form state
  const [hierarchyForm, setHierarchyForm] = useState<Partial<RoleHierarchy>>({
    name: '',
    level: 1,
    parentRole: undefined,
    inheritedPermissions: [],
    customPermissions: [],
    canManageRoles: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [templatesData, hierarchiesData] = await Promise.all([
        roleTemplateService.listRoleTemplates(),
        roleTemplateService.listRoleHierarchies()
      ]);
      setTemplates(templatesData);
      setHierarchies(hierarchiesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load role templates and hierarchies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const newTemplate = await roleTemplateService.createRoleTemplate(templateForm as Omit<RoleTemplate, 'id' | 'createdAt' | 'updatedAt'>);
      setTemplates([...templates, newTemplate]);
      toast.success('Role template created successfully');
      setTemplateForm({
        name: '',
        description: '',
        permissions: {
          clientManagement: false,
          resourceCreation: false,
          analyticsAccess: false,
          teamManagement: false,
          billingAccess: false,
          settingsAccess: false,
          reportGeneration: false,
          userManagement: false
        },
        settings: {
          maxClients: 0,
          featureAccess: [],
          notificationPreferences: {},
          dataAccess: {
            canViewAllClients: false,
            canViewAllCoaches: false,
            canViewAnalytics: false,
            canViewBilling: false
          }
        }
      });
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create role template');
    }
  };

  const handleCreateHierarchy = async () => {
    try {
      const newHierarchy = await roleTemplateService.createRoleHierarchy(hierarchyForm as Omit<RoleHierarchy, 'id' | 'createdAt' | 'updatedAt'>);
      setHierarchies([...hierarchies, newHierarchy]);
      toast.success('Role hierarchy created successfully');
      setHierarchyForm({
        name: '',
        level: 1,
        parentRole: undefined,
        inheritedPermissions: [],
        customPermissions: [],
        canManageRoles: []
      });
    } catch (error) {
      console.error('Error creating hierarchy:', error);
      toast.error('Failed to create role hierarchy');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Role Templates & Hierarchy</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="templates">Role Templates</TabsTrigger>
          <TabsTrigger value="hierarchy">Role Hierarchy</TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Create Role Template</CardTitle>
              <CardDescription>Define a new role template with permissions and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="templateDescription">Description</Label>
                  <Input
                    id="templateDescription"
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {Object.entries(templateForm.permissions || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => 
                            setTemplateForm({
                              ...templateForm,
                              permissions: {
                                ...templateForm.permissions,
                                [key]: checked
                              }
                            })
                          }
                        />
                        <Label>{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreateTemplate}>Create Template</Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Existing Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <CardTitle>{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        Created: {new Date(template.createdAt).toLocaleDateString()}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(template.permissions)
                          .filter(([_, value]) => value)
                          .map(([key]) => (
                            <span
                              key={key}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                            >
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="hierarchy">
          <Card>
            <CardHeader>
              <CardTitle>Create Role Hierarchy</CardTitle>
              <CardDescription>Define a new role hierarchy with parent-child relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hierarchyName">Hierarchy Name</Label>
                  <Input
                    id="hierarchyName"
                    value={hierarchyForm.name}
                    onChange={(e) => setHierarchyForm({ ...hierarchyForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="hierarchyLevel">Level</Label>
                  <Input
                    id="hierarchyLevel"
                    type="number"
                    value={hierarchyForm.level}
                    onChange={(e) => setHierarchyForm({ ...hierarchyForm, level: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="parentRole">Parent Role (Optional)</Label>
                  <Input
                    id="parentRole"
                    value={hierarchyForm.parentRole}
                    onChange={(e) => setHierarchyForm({ ...hierarchyForm, parentRole: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateHierarchy}>Create Hierarchy</Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Existing Hierarchies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hierarchies.map((hierarchy) => (
                <Card key={hierarchy.id}>
                  <CardHeader>
                    <CardTitle>{hierarchy.name}</CardTitle>
                    <CardDescription>Level {hierarchy.level}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        Created: {new Date(hierarchy.createdAt).toLocaleDateString()}
                      </p>
                      {hierarchy.parentRole && (
                        <p className="text-sm">
                          Parent Role: {hierarchy.parentRole}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {hierarchy.inheritedPermissions.map((permission) => (
                          <span
                            key={permission}
                            className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 