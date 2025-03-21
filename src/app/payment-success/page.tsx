'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'success' | 'processing' | 'error'>('processing');
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

    if (paymentIntent && paymentIntentClientSecret) {
      // Here you could verify the payment status with your backend
      setStatus('success');
    } else {
      setStatus('error');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {status === 'processing' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Processing payment...</h2>
            <p className="mt-2 text-gray-600">Please wait while we confirm your payment.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-900">Payment Successful!</h2>
            <p className="mt-2 text-gray-600">Thank you for your purchase.</p>
            <div className="mt-6">
              <Link
                href="/test-payment"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Make Another Test Payment
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-900">Payment Error</h2>
            <p className="mt-2 text-gray-600">There was an error processing your payment.</p>
            <div className="mt-6">
              <Link
                href="/test-payment"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 