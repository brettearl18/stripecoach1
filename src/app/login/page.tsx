'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Get the redirect URL from the query parameters
    const params = new URLSearchParams(window.location.search);
    const redirectUrl = params.get('redirect') || '/admin/dashboard2';

    // Check if user is already authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // If user is authenticated, redirect to the specified URL
        router.replace(redirectUrl);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Please wait...
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Checking authentication status
          </p>
        </div>
      </div>
    </div>
  );
} 