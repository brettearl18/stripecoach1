'use client';

import { useState } from 'react';
import { 
  CreditCardIcon, 
  BanknotesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  LinkIcon
} from '@heroicons/react/24/outline';

export default function PaymentsPage() {
  const [payments] = useState([
    {
      id: 'pay_1234',
      client: 'Sarah Johnson',
      coach: 'Michael Smith',
      amount: 150.00,
      status: 'completed',
      date: '2024-03-22',
      type: 'Session Payment',
      method: 'Credit Card'
    },
    {
      id: 'pay_5678',
      client: 'James Wilson',
      coach: 'Emma Davis',
      amount: 299.99,
      status: 'pending',
      date: '2024-03-21',
      type: 'Monthly Package',
      method: 'Bank Transfer'
    },
    {
      id: 'pay_9012',
      client: 'Lisa Brown',
      coach: 'Michael Smith',
      amount: 75.00,
      status: 'failed',
      date: '2024-03-20',
      type: 'Session Payment',
      method: 'Credit Card'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-400';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400';
      case 'failed':
        return 'bg-red-500/10 text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'pending':
        return <ArrowPathIcon className="h-5 w-5 text-yellow-400" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#13141A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Payments</h1>
            <p className="text-gray-400">Manage and track all payment transactions</p>
          </div>
          <div className="flex space-x-4">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm flex items-center">
              <LinkIcon className="h-5 w-5 mr-2" />
              Link Stripe
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center">
              <BanknotesIcon className="h-5 w-5 mr-2" />
              Export Transactions
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1a1b1e] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                <h3 className="text-2xl font-bold text-white">$12,450.80</h3>
                <p className="text-green-400 text-sm mt-1">+12.5% from last month</p>
              </div>
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Active Clients</p>
                <h3 className="text-2xl font-bold text-white">284</h3>
                <p className="text-green-400 text-sm mt-1">+8.2% from last month</p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Pending Payments</p>
                <h3 className="text-2xl font-bold text-white">12</h3>
                <p className="text-yellow-400 text-sm mt-1">4 require attention</p>
              </div>
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <ArrowPathIcon className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1b1e] rounded-lg p-6 border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Monthly Recurring</p>
                <h3 className="text-2xl font-bold text-white">$8,250.00</h3>
                <p className="text-green-400 text-sm mt-1">+15.3% from last month</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-[#1a1b1e] rounded-lg border border-gray-800">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Transaction ID</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Client</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Coach</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Amount</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Method</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 px-4 text-gray-300">{payment.id}</td>
                      <td className="py-3 px-4 text-gray-300">{payment.client}</td>
                      <td className="py-3 px-4 text-gray-300">{payment.coach}</td>
                      <td className="py-3 px-4 text-gray-300">${payment.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-gray-300">{payment.type}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {payment.method === 'Credit Card' ? (
                            <CreditCardIcon className="h-4 w-4 text-gray-400 mr-2" />
                          ) : (
                            <BanknotesIcon className="h-4 w-4 text-gray-400 mr-2" />
                          )}
                          <span className="text-gray-300">{payment.method}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{payment.date}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {getStatusIcon(payment.status)}
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(payment.status)}`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </div>
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
  );
} 