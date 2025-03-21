'use client';

import { useState } from 'react';
import { ArrowLeftIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { CurrencyDollarIcon, UserGroupIcon, ChartBarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { subscriptionMetrics, testSubscriptions } from '@/lib/test-data';

export default function SubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredSubscriptions = testSubscriptions.filter(sub => {
    const matchesSearch = 
      sub.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const MetricCard = ({ title, value, icon: Icon, trend = null, trendValue = null }) => (
    <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_-4px_rgba(16,24,40,0.08)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-semibold text-slate-900 mt-2">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpIcon className="w-4 h-4 mr-1" /> : <ArrowDownIcon className="w-4 h-4 mr-1" />}
              <span>{trendValue}%</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-indigo-50 rounded-lg">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
      </div>
    </div>
  );

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
          <h1 className="text-2xl font-bold text-slate-700">Subscriptions Overview</h1>
          <span className="text-slate-500">
            {testSubscriptions.length} total subscriptions
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Monthly Recurring Revenue"
            value={`$${subscriptionMetrics.totalRevenue.toLocaleString()}`}
            icon={CurrencyDollarIcon}
            trend="up"
            trendValue={subscriptionMetrics.revenueGrowth}
          />
          <MetricCard
            title="Active Subscriptions"
            value={subscriptionMetrics.activeSubscriptions}
            icon={UserGroupIcon}
          />
          <MetricCard
            title="Average Subscription Value"
            value={`$${subscriptionMetrics.averageSubscriptionValue}`}
            icon={ChartBarIcon}
          />
          <MetricCard
            title="Monthly Churn Rate"
            value={`${subscriptionMetrics.churnRate}%`}
            icon={CalendarIcon}
            trend="down"
            trendValue={subscriptionMetrics.churnRate}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-[0_4px_20px_-4px_rgba(16,24,40,0.08)]">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by client name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="past_due">Past Due</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Client</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Plan</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Start Date</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Next Billing</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Payment Method</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredSubscriptions.map((subscription) => (
                      <tr key={subscription.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="font-medium text-gray-900">{subscription.clientName}</div>
                          <div className="text-gray-500">{subscription.clientEmail}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{subscription.plan}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${subscription.amount}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${subscription.status === 'Active' ? 'bg-green-100 text-green-800' :
                              subscription.status === 'Past_due' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'}`}>
                            {subscription.status}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{subscription.startDate}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{subscription.nextBilling}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{subscription.paymentMethod}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <Link
                            href={`/admin/subscriptions/${subscription.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 