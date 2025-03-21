'use client';

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from './PaymentForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscriptionPaymentStatusProps {
  subscriptionStatus: 'active' | 'past_due' | 'unpaid' | 'canceled';
  lastPaymentStatus?: 'succeeded' | 'failed' | 'requires_payment_method';
  lastPaymentError?: string;
  paymentIntentId?: string;
}

export default function SubscriptionPaymentStatus({
  subscriptionStatus,
  lastPaymentStatus,
  lastPaymentError,
  paymentIntentId
}: SubscriptionPaymentStatusProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const handleRetryPayment = async () => {
    if (!paymentIntentId) return;
    
    try {
      setIsRetrying(true);
      setError(null);

      const response = await fetch('/api/retry-subscription-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentIntentId }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setClientSecret(data.clientSecret);
    } catch (err) {
      setError('Failed to initiate payment retry');
      console.error('Error:', err);
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusBadgeClass = () => {
    switch (subscriptionStatus) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unpaid':
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Subscription Status</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium mt-2 ${getStatusBadgeClass()}`}>
            {subscriptionStatus.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      {lastPaymentStatus === 'failed' && (
        <div className="mt-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Payment Failed</h3>
                {lastPaymentError && (
                  <p className="text-sm text-red-700 mt-1">{lastPaymentError}</p>
                )}
              </div>
            </div>
          </div>

          {!clientSecret ? (
            <button
              onClick={handleRetryPayment}
              disabled={isRetrying}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${isRetrying ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isRetrying ? 'Processing...' : 'Retry Payment'}
            </button>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm />
            </Elements>
          )}

          {error && (
            <div className="mt-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 