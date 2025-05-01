'use client';

import FirebaseConnectionTest from '@/components/FirebaseConnectionTest';

export default function TestConnectionPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Firebase Connection Test
          </h1>
          <p className="mt-2 text-gray-600">
            This page tests the connection to various Firebase services
          </p>
        </div>
        <FirebaseConnectionTest />
      </div>
    </div>
  );
} 