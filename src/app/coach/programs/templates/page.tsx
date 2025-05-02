'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProgramTemplate } from '@/types/program';
import { programTemplateService } from '@/lib/services/programTemplateService';
import { DocumentSnapshot } from 'firebase/firestore';

export default function ProgramTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ProgramTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async (loadMore = false) => {
    try {
      const response = await programTemplateService.listTemplates({
        status: 'published',
        lastDoc: loadMore ? lastDoc : undefined,
        limit: 10
      });

      if (loadMore) {
        setTemplates(prev => [...prev, ...response.templates]);
      } else {
        setTemplates(response.templates);
      }

      setLastDoc(response.lastDoc);
      setHasMore(response.templates.length === 10);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    router.push('/coach/programs/templates/new');
  };

  const handleEditTemplate = (templateId: string) => {
    router.push(`/coach/programs/templates/${templateId}`);
  };

  const handleDuplicateTemplate = async (templateId: string, currentTitle: string) => {
    try {
      const newTitle = `${currentTitle} (Copy)`;
      await programTemplateService.duplicateTemplate(templateId, newTitle);
      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await programTemplateService.deleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Program Templates</h1>
        <button
          onClick={handleCreateTemplate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <div
            key={template.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{template.title}</h2>
              <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                {template.metadata.status}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4 line-clamp-2">{template.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {template.metadata.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{template.duration} weeks</span>
              <span>v{template.metadata.version}</span>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => handleDuplicateTemplate(template.id, template.title)}
                className="text-blue-600 hover:text-blue-700"
              >
                Duplicate
              </button>
              <button
                onClick={() => handleEditTemplate(template.id)}
                className="text-green-600 hover:text-green-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteTemplate(template.id)}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No templates found. Create your first template to get started.</p>
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={() => loadTemplates(true)}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
} 