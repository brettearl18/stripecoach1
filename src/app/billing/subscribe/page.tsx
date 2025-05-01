'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/config/subscription-plans';
import { getOrganization, updateOrganization } from '@/lib/organizations';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function SubscribePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planId = searchParams.get('plan') as Lowercase<SubscriptionPlan> | null;
  const orgId = searchParams.get('orgId');

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    if (!planId || !orgId) {
      router.push('/onboarding');
      return;
    }

    const plan = SUBSCRIPTION_PLANS[planId.toUpperCase() as SubscriptionPlan];
    if (!plan || plan.price === 0) {
      router.push('/dashboard');
      return;
    }
  }, [user, planId, orgId, router]);

  const handleSubscribe = async () => {
    if (!user || !planId || !orgId) return;

    try {
      setLoading(true);
      setError(null);

      const plan = SUBSCRIPTION_PLANS[planId.toUpperCase() as SubscriptionPlan];
      
      // Create a Stripe Checkout Session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
          organizationId: orgId,
          successUrl: `${window.location.origin}/dashboard?subscription=success`,
          cancelUrl: `${window.location.origin}/billing/subscribe?plan=${planId}&orgId=${orgId}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;

    } catch (err: any) {
      console.error('Subscription error:', err);
      setError(err.message || 'Failed to process subscription');
    } finally {
      setLoading(false);
    }
  };

  if (!user || !planId || !orgId) {
    return null;
  }

  const plan = SUBSCRIPTION_PLANS[planId.toUpperCase() as SubscriptionPlan];
  if (!plan || plan.price === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Subscribe to {plan.name}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Get access to premium features and grow your coaching business
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Plan Details</h3>
              <div className="mt-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Price</span>
                  <span>${plan.price}/month</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Features</h4>
              <ul className="mt-2 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start text-sm text-gray-500">
                    <svg
                      className="h-5 w-5 text-green-500 shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-2">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleSubscribe}
              disabled={loading}
            >
              {loading ? 'Processing...' : `Subscribe for $${plan.price}/month`}
            </button>

            <div className="text-xs text-center text-gray-500">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
              You can cancel your subscription at any time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 