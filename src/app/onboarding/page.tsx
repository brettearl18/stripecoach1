'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createOrganization } from '@/lib/organizations';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/config/subscription-plans';
import { CheckIcon } from '@heroicons/react/24/outline';

interface OnboardingFormData {
  organizationName: string;
  plan: SubscriptionPlan;
  branding: {
    logo?: string;
    colors: {
      primary: string;
      secondary: string;
    };
  };
}

const steps = [
  { id: 'organization', name: 'Organization', description: 'Set up your organization' },
  { id: 'plan', name: 'Choose Plan', description: 'Select your subscription plan' },
  { id: 'branding', name: 'Branding', description: 'Customize your appearance' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingFormData>({
    organizationName: '',
    plan: 'FREE',
    branding: {
      colors: {
        primary: '#4F46E5',
        secondary: '#9333EA',
      },
    },
  });
  const [loading, setLoading] = useState(false);

  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const orgId = await createOrganization({
        name: formData.organizationName,
        plan: formData.plan,
        ownerId: user.uid,
        settings: {
          branding: formData.branding,
          features: {
            customForms: SUBSCRIPTION_PLANS[formData.plan].features.includes('Custom check-in forms'),
            whiteLabel: SUBSCRIPTION_PLANS[formData.plan].features.includes('White-label solution'),
            apiAccess: SUBSCRIPTION_PLANS[formData.plan].features.includes('API access'),
          },
        },
      });

      // If not on free plan, redirect to billing
      if (formData.plan !== 'FREE') {
        router.push(`/billing/subscribe?plan=${formData.plan.toLowerCase()}&orgId=${orgId}`);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                type="text"
                id="organizationName"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                required
              />
            </div>
            <button
              type="button"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setCurrentStep(1)}
              disabled={!formData.organizationName}
            >
              Next
            </button>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {(Object.keys(SUBSCRIPTION_PLANS) as SubscriptionPlan[]).map((planKey) => {
                const plan = SUBSCRIPTION_PLANS[planKey];
                return (
                  <div
                    key={plan.id}
                    className={`relative rounded-lg border p-4 cursor-pointer ${
                      formData.plan === planKey
                        ? 'border-indigo-600 ring-2 ring-indigo-600'
                        : 'border-gray-300'
                    }`}
                    onClick={() => setFormData({ ...formData, plan: planKey })}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex justify-between">
                        <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
                        {formData.plan === planKey && (
                          <CheckIcon className="h-5 w-5 text-indigo-600" />
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        ${plan.price}/month
                      </p>
                      <ul className="mt-4 space-y-2 flex-grow">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start">
                            <CheckIcon className="h-5 w-5 text-green-500 shrink-0" />
                            <span className="ml-2 text-sm text-gray-500">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setCurrentStep(0)}
              >
                Back
              </button>
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setCurrentStep(2)}
              >
                Next
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                Primary Color
              </label>
              <input
                type="color"
                id="primaryColor"
                className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.branding.colors.primary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    branding: {
                      ...formData.branding,
                      colors: { ...formData.branding.colors, primary: e.target.value },
                    },
                  })
                }
              />
            </div>
            <div>
              <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700">
                Secondary Color
              </label>
              <input
                type="color"
                id="secondaryColor"
                className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.branding.colors.secondary}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    branding: {
                      ...formData.branding,
                      colors: { ...formData.branding.colors, secondary: e.target.value },
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Logo</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData({
                                ...formData,
                                branding: {
                                  ...formData.branding,
                                  logo: reader.result as string,
                                },
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </div>
        );
    }
  };

  if (!user) {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Set up your coaching business
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <nav aria-label="Progress">
            <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
              {steps.map((step, index) => (
                <li key={step.id} className="md:flex-1">
                  <div
                    className={`group pl-4 py-2 flex flex-col border-l-4 ${
                      index < currentStep
                        ? 'border-indigo-600 hover:border-indigo-800'
                        : index === currentStep
                        ? 'border-indigo-600'
                        : 'border-gray-200 hover:border-gray-300'
                    } md:pl-0 md:pt-4 md:pb-0 md:border-l-0 md:border-t-4`}
                  >
                    <span
                      className={`text-xs font-semibold tracking-wide uppercase ${
                        index < currentStep
                          ? 'text-indigo-600 group-hover:text-indigo-800'
                          : index === currentStep
                          ? 'text-indigo-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </span>
                    <span className="text-sm font-medium">{step.description}</span>
                  </div>
                </li>
              ))}
            </ol>
          </nav>

          <form className="mt-6 space-y-6" onSubmit={handleOrganizationSubmit}>
            {renderStep()}
          </form>
        </div>
      </div>
    </div>
  );
} 