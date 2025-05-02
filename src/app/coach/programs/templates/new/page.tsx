'use client';

import { useRouter } from 'next/navigation';
import { ProgramTemplate } from '@/types/program';
import { programTemplateService } from '@/lib/services/programTemplateService';
import ProgramTemplateForm from '@/components/ProgramTemplateForm';

export default function NewTemplatePage() {
  const router = useRouter();

  const handleSubmit = async (data: Omit<ProgramTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await programTemplateService.createTemplate(data);
      router.push('/coach/programs/templates');
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleCancel = () => {
    router.push('/coach/programs/templates');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Template</h1>
        <p className="text-gray-500">Create a new program template for your coaching practice</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <ProgramTemplateForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
} 