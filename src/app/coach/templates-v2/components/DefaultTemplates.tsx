'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Loader2, Upload } from 'lucide-react'
import TemplateImport from './TemplateImport'

interface Template {
  id: string
  name: string
  type: string
  description: string
  isDefault?: boolean
  frequency?: string
}

export function DefaultTemplates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showImport, setShowImport] = useState(false)

  useEffect(() => {
    loadTemplates()
  }, [user?.uid])

  const loadTemplates = async () => {
    if (!user?.uid) return

    try {
      // TODO: Replace with actual template service call
      const response = await fetch(`/api/coach/${user.uid}/templates`)
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Error loading templates:', error)
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleDefaultToggle = async (templateId: string, isDefault: boolean) => {
    if (!user?.uid) return

    setSaving(true)
    try {
      // TODO: Replace with actual template service call
      await fetch(`/api/coach/${user.uid}/templates/${templateId}/default`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault })
      })

      setTemplates(templates.map(template => 
        template.id === templateId 
          ? { ...template, isDefault }
          : template
      ))

      toast.success(isDefault 
        ? 'Template set as default' 
        : 'Template removed from defaults'
      )
    } catch (error) {
      console.error('Error updating template:', error)
      toast.error('Failed to update template')
    } finally {
      setSaving(false)
    }
  }

  const getTemplateBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'check_in':
        return 'bg-blue-100 text-blue-800'
      case 'progress_photos':
        return 'bg-green-100 text-green-800'
      case 'measurements':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Templates</CardTitle>
            <CardDescription>Manage your check-in templates</CardDescription>
          </div>
          <Button onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Import Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showImport && (
          <div className="mb-6">
            <TemplateImport
              onImport={(template) => {
                // TODO: Save imported template to backend
                toast.success('Template imported successfully')
                setShowImport(false)
                loadTemplates() // Refresh the list
              }}
            />
          </div>
        )}
        <div className="space-y-4">
          {templates.map(template => (
            <div
              key={template.id}
              className="flex items-start justify-between p-4 rounded-lg border"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{template.name}</h4>
                  <Badge className={getTemplateBadgeColor(template.type)}>
                    {template.type.replace('_', ' ')}
                  </Badge>
                  {template.frequency && (
                    <Badge variant="outline">
                      {template.frequency}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {template.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`default-${template.id}`} className="sr-only">
                  Set as default
                </Label>
                <Switch
                  id={`default-${template.id}`}
                  checked={template.isDefault}
                  onCheckedChange={(checked) => handleDefaultToggle(template.id, checked)}
                  disabled={saving}
                />
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              No templates found. Create some templates first.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 