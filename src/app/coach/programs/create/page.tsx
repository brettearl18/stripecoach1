import React from 'react';
import { useRouter } from 'next/navigation';
import ProgramBuilder from '@/components/ProgramBuilder';
import { ProgramTemplate } from '@/types/program';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function CreateProgramPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSubmit = async (program: ProgramTemplate) => {
    try {
      // Add the coach's ID to the program metadata
      program.metadata.createdBy = user?.id || '';
      program.metadata.lastModifiedBy = user?.id || '';

      // Save the program to Firestore
      const response = await fetch('/api/programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(program),
      });

      if (!response.ok) {
        throw new Error('Failed to create program');
      }

      toast.success('Program created successfully');
      router.push('/coach/programs');
    } catch (error) {
      console.error('Error creating program:', error);
      toast.error('Failed to create program');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Create New Program</h1>
      <ProgramBuilder onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
} 