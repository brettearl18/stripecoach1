'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { testSubscriptions } from '@/lib/test-data';
import { useParams } from 'next/navigation';

export default function SubscriptionDetailsPage() {
  const params = useParams();
  const subscriptionId = params.id as string;
  
  // Find subscription from test data
  const subscription = testSubscriptions.find(sub => sub.id === subscriptionId) || testSubscriptions[0];
  
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleUpdatePayment = async () => {
    setIsUpdatingPayment(true);
    // TODO: Implement payment method update logic
    setTimeout(() => setIsUpdatingPayment(false), 1000);
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    // TODO: Implement subscription cancellation logic
    setTimeout(() => setIsCancelling(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin/subscriptions"
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Subscriptions
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Subscription Details
          </h1>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Client Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Client Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="mt-1">{subscription.clientName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1">{subscription.clientEmail}</p>
              </div>
            </div>
          </div>

          {/* Subscription Details */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Plan</p>
                <p className="mt-1">{subscription.plan}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Amount</p>
                <p className="mt-1">${subscription.amount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <p className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${subscription.status === 'Active' ? 'bg-green-100 text-green-800' :
                    subscription.status === 'Past_due' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}`}>
                  {subscription.status}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Next Billing</p>
                <p className="mt-1">{subscription.nextBilling}</p>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Payment Method</h2>
              <button
                onClick={handleUpdatePayment}
                disabled={isUpdatingPayment}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isUpdatingPayment ? 'Updating...' : 'Update Payment Method'}
              </button>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-500">{subscription.paymentMethod}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Actions</h2>
            <div className="space-x-4">
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling || subscription.status === 'Canceled'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 