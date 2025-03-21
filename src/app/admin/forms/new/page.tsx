'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import FormBuilder with no SSR to avoid hydration issues
const FormBuilder = dynamic(() => import('@/components/checkIn/FormBuilder'), {
  ssr: false,
});

export default function NewFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-gray-400">Loading form builder...</div>
      </div>
    }>
      <FormBuilder />
    </Suspense>
  );
} 