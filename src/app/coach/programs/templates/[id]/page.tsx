'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProgramTemplate } from '@/types/program';
import { programTemplateService } from '@/lib/services/programTemplateService';
import ProgramTemplateForm from '@/components/ProgramTemplateForm';

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [template, setTemplate] = useState<ProgramTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplate();
  }, [params.id]);

  const loadTemplate = async () => {
    try {
      const templateData = await programTemplateService.getTemplate(params.id);
      setTemplate(templateData);
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: Omit<ProgramTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await programTemplateService.updateTemplate(params.id, data);
      router.push('/coach/programs/templates');
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  const handleCancel = () => {
    router.push('/coach/programs/templates');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Template Not Found</h1>
          <p className="text-gray-500 mb-4">The template you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/coach/programs/templates')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Template</h1>
        <p className="text-gray-500">Make changes to your program template</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <ProgramTemplateForm
          initialData={template}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
} 