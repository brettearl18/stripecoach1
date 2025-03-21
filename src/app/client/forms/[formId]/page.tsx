'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCheckInForms, saveFormSubmission, getFormSubmissions, type CheckInForm } from '@/lib/services/firebaseService';
import CheckInFormView from '@/components/checkIn/CheckInFormView';
import toast from 'react-hot-toast';

export default function ClientFormPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<CheckInForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startTime] = useState<number>(Date.now());

  useEffect(() => {
    const loadForm = async () => {
      try {
        const forms = await getCheckInForms();
        const form = forms.find(f => f.id === params.formId);
        
        if (!form) {
          toast.error('Form not found');
          router.push('/client/forms');
          return;
        }

        setForm(form);
      } catch (error) {
        console.error('Error loading form:', error);
        toast.error('Failed to load form');
      } finally {
        setIsLoading(false);
      }
    };

    loadForm();
  }, [params.formId, router]);

  const handleSubmit = async (answers: Record<number, any>) => {
    try {
      setIsLoading(true);
      
      // Calculate completion time in seconds
      const completionTime = Math.round((Date.now() - startTime) / 1000);

      // Get previous submissions for analytics
      const previousSubmissions = await getFormSubmissions(params.formId as string, 'current_client_id'); // Replace with actual client ID

      // Save submission with completion time
      await saveFormSubmission({
        formId: params.formId as string,
        clientId: 'current_client_id', // Replace with actual client ID
        answers,
        submittedAt: new Date(),
        metrics: {
          completionTime,
          questionsAnswered: Object.keys(answers).length,
          requiredQuestionsAnswered: form?.questions.filter(q => q.required).length || 0
        }
      }, previousSubmissions);
      
      toast.success('Form submitted successfully!');
      router.push('/client/forms');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F15] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading form...
        </div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return (
    <CheckInFormView
      form={form}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
} 