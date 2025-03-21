'use client';

import { FormBuilder } from '@/components/checkIn/FormBuilder';
import { useRouter } from 'next/navigation';

export function NewFormPageClient() {
  const router = useRouter();
  
  const handleSaveForm = async (formData: any) => {
    try {
      // TODO: Implement form saving logic
      console.log('Form data to save:', formData);
      router.push('/admin/forms');
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  return (
    <main className="min-h-screen">
      <FormBuilder onSave={handleSaveForm} />
    </main>
  );
} 