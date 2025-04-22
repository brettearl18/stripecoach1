'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'CredentialsSignin':
        return 'Invalid email or password. Please try again.';
      case 'OAuthSignin':
        return 'Error signing in with your social account. Please try again.';
      case 'OAuthCallback':
        return 'Error completing the sign-in process. Please try again.';
      case 'OAuthCreateAccount':
        return 'Error creating your account. Please try again.';
      case 'EmailCreateAccount':
        return 'Error creating your account. Please try again.';
      case 'Callback':
        return 'Error during sign-in. Please try again.';
      case 'OAuthAccountNotLinked':
        return 'This email is already registered with a different sign-in method.';
      case 'EmailSignin':
        return 'Error sending the sign-in email. Please try again.';
      case 'Default':
      default:
        return 'An error occurred during sign-in. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
          <div className="mt-2 text-center text-sm text-gray-600">
            <p className="text-red-600">{getErrorMessage(error)}</p>
          </div>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center">
            <Link
              href="/login"
              className="group relative w-1/2 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 