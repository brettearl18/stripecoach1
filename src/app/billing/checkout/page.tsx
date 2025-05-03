'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/config/subscription-plans';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '@/components/PaymentForm';
import { toast } from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const planId = searchParams.get('plan') as SubscriptionPlan;
  const organizationId = searchParams.get('organizationId');

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    if (!planId || !organizationId) {
      router.push('/billing');
      return;
    }

    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      router.push('/billing');
      return;
    }

    const initializeCheckout = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: plan.price * 100, // Convert to cents
            currency: 'usd',
            metadata: {
              planId,
              organizationId,
            },
          }),
        });

        const data = await response.json();

        if (data.error) {
          setError(data.error);
          return;
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        setError('Failed to initialize checkout');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [user, planId, organizationId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/billing')}
            className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Return to Billing
          </button>
        </div>
      </div>
    );
  }

  const plan = SUBSCRIPTION_PLANS[planId];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Subscription</h1>
            
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Selected Plan</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                    <p className="text-gray-500">{plan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">${plan.price}/month</p>
                  </div>
                </div>
              </div>
            </div>

            {clientSecret && (
              <div className="mt-6">
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm />
                </Elements>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 