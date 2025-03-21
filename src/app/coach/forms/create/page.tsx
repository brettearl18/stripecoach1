'use client';

import { FormBuilder } from '@/components/checkIn/FormBuilder';

export default function CreateFormPage() {
  const handleSaveForm = async (formData: any) => {
    try {
      // TODO: Implement form saving logic
      console.log('Form data to save:', formData);
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <FormBuilder onSave={handleSaveForm} />
    </div>
  );
} 