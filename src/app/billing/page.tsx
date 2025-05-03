'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/config/subscription-plans';
import { getOrganizationSubscription } from '@/lib/services/subscriptionService';
import { toast } from 'react-hot-toast';

export default function BillingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push('/sign-in');
      return;
    }

    const fetchSubscription = async () => {
      try {
        const subscription = await getOrganizationSubscription(user.organizationId);
        setCurrentSubscription(subscription);
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast.error('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user, router]);

  const handleSubscribe = (planId: SubscriptionPlan) => {
    router.push(`/billing/checkout?plan=${planId}&organizationId=${user?.organizationId}`);
  };

  const handleManageSubscription = () => {
    // Redirect to Stripe Customer Portal
    window.location.href = '/api/create-portal-session';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Subscription Plans
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Choose the perfect plan for your coaching business
          </p>
        </div>

        {currentSubscription && (
          <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Current Subscription</h2>
              <div className="mt-2">
                <p className="text-gray-600">
                  Plan: {SUBSCRIPTION_PLANS[currentSubscription.priceId as SubscriptionPlan]?.name || 'Unknown'}
                </p>
                <p className="text-gray-600">
                  Status: {currentSubscription.status}
                </p>
                <p className="text-gray-600">
                  Next billing date: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}
                </p>
                <button
                  onClick={handleManageSubscription}
                  className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Manage Subscription
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => (
            <div
              key={planId}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="mt-4 text-gray-500">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </p>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-6 w-6 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(planId as SubscriptionPlan)}
                  className={`mt-8 w-full py-3 px-6 rounded-md font-semibold text-white ${
                    currentSubscription?.priceId === plan.stripePriceId
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  disabled={currentSubscription?.priceId === plan.stripePriceId}
                >
                  {currentSubscription?.priceId === plan.stripePriceId
                    ? 'Current Plan'
                    : 'Subscribe'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 