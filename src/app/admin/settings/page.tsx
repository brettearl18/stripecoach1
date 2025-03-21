'use client';

import { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  BanknotesIcon,
  CogIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';

export default function SettingsPage() {
  const [stripeConnected, setStripeConnected] = useState(false);
  const [stripeAccountInfo, setStripeAccountInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStripeConnection() {
      try {
        const response = await fetch('/api/stripe/account/status');
        const data = await response.json();
        setStripeConnected(data.connected);
        setStripeAccountInfo(data.account);
      } catch (error) {
        console.error('Error checking Stripe connection:', error);
      }
      setLoading(false);
    }

    checkStripeConnection();
  }, []);

  const handleConnectStripe = async () => {
    try {
      const response = await fetch('/api/stripe/account/connect', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error connecting Stripe:', error);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/admin"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-700">Settings</h1>
        </div>

        {/* Payment Settings */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(16,24,40,0.08)] p-6">
            <div className="flex items-center gap-2 mb-6">
              <CreditCardIcon className="w-6 h-6 text-slate-700" />
              <h2 className="text-lg font-semibold text-slate-700">Payment Settings</h2>
            </div>

            <div className="space-y-6">
              {/* Stripe Connection Status */}
              <div className="border rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-medium text-slate-900">Stripe Account Connection</h3>
                    <p className="text-sm text-slate-500">
                      Connect your Stripe account to receive payments from clients
                    </p>
                  </div>
                  {loading ? (
                    <div className="animate-pulse bg-slate-200 h-8 w-24 rounded-lg" />
                  ) : stripeConnected ? (
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleConnectStripe}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Connect Stripe
                    </button>
                  )}
                </div>

                {stripeConnected && stripeAccountInfo && (
                  <div className="mt-4 border-t pt-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Account Type</span>
                        <span className="font-medium text-slate-900">
                          {stripeAccountInfo.type === 'express' ? 'Express' : 'Standard'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Payouts</span>
                        <span className={`font-medium ${
                          stripeAccountInfo.payouts_enabled
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}>
                          {stripeAccountInfo.payouts_enabled ? 'Enabled' : 'Pending'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Charges</span>
                        <span className={`font-medium ${
                          stripeAccountInfo.charges_enabled
                            ? 'text-emerald-600'
                            : 'text-amber-600'
                        }`}>
                          {stripeAccountInfo.charges_enabled ? 'Enabled' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <a
                        href={stripeAccountInfo.dashboard_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        View Stripe Dashboard
                      </a>
                      <button
                        onClick={() => window.location.href = '/api/stripe/account/refresh'}
                        className="text-slate-600 hover:text-slate-700 text-sm font-medium"
                      >
                        Refresh Status
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Plans */}
              <div className="border rounded-xl p-6">
                <h3 className="text-base font-medium text-slate-900 mb-4">Payments</h3>
                {stripeConnected ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">Failed Payments</h4>
                        <p className="text-sm text-slate-500">View and manage failed payments</p>
                      </div>
                      <Link
                        href="/admin/payments/failed"
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">Payment History</h4>
                        <p className="text-sm text-slate-500">View all payment transactions</p>
                      </div>
                      <Link
                        href="/admin/payments/history"
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">Refunds</h4>
                        <p className="text-sm text-slate-500">View and manage refunds</p>
                      </div>
                      <Link
                        href="/admin/payments/refunds"
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-500">
                      Connect your Stripe account to manage payments
                    </p>
                  </div>
                )}
              </div>

              {/* Payout Settings */}
              <div className="border rounded-xl p-6">
                <h3 className="text-base font-medium text-slate-900 mb-4">Payout Settings</h3>
                {stripeConnected ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Payout Schedule</span>
                      <select className="form-select rounded-lg border-slate-200">
                        <option>Daily</option>
                        <option>Weekly</option>
                        <option>Monthly</option>
                      </select>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Minimum Payout Amount</span>
                      <input
                        type="number"
                        className="form-input rounded-lg border-slate-200 w-32"
                        placeholder="$0.00"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-500">
                      Connect your Stripe account to manage payout settings
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 