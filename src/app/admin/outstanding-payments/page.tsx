'use client';

import { useState } from 'react';
import { testClients, formatCurrency } from '@/lib/test-data';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import RetryPaymentDialog from '@/app/components/RetryPaymentDialog';
import { useAuth } from '@/contexts/AuthContext';

export default function OutstandingPaymentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const clientsWithOutstanding = testClients
    .filter(client => client.outstandingPayment > 0)
    .sort((a, b) => b.outstandingPayment - a.outstandingPayment);

  const handleRetryClick = (client: any) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  };

  const handleRetryPayment = async (paymentMethodId: string) => {
    if (!selectedClient || !user) return;

    try {
      // First get the payment methods
      const paymentMethodsResponse = await fetch(
        `/api/stripe/payment-methods?customerId=${selectedClient.stripeCustomerId}`
      );
      
      if (!paymentMethodsResponse.ok) {
        throw new Error('Failed to fetch payment methods');
      }

      const paymentMethods = await paymentMethodsResponse.json();

      if (!paymentMethods.data?.length) {
        toast.error('No payment method available');
        return;
      }

      // Retry the payment with the selected payment method
      const response = await fetch('/api/stripe/retry-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: selectedClient.stripeCustomerId,
          amount: selectedClient.outstandingPayment * 100, // Convert to cents
          paymentMethodId,
          clientId: selectedClient.id,
          clientName: selectedClient.name,
          originalPaymentId: selectedClient.lastFailedPaymentId || 'unknown',
          retriedBy: user.email,
        }),
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success('Payment successfully retried');
      // Refresh the page to update the list
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to retry payment');
      throw error; // Re-throw to be handled by the dialog
    }
  };

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/admin"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-700">Failed Payments</h1>
          <span className="text-slate-500">
            {clientsWithOutstanding.length} clients with outstanding payments
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(16,24,40,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Outstanding Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Payment Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {clientsWithOutstanding.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{client.name}</div>
                        <div className="text-sm text-slate-500">{client.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">
                        {formatCurrency(client.outstandingPayment)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {client.lastPaymentDate || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        Failed
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleRetryClick(client)}
                          disabled={isLoading}
                          className="text-indigo-600 hover:text-indigo-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Retry Payment
                        </button>
                        <button
                          onClick={() => window.location.href = `/admin/clients/${client.id}`}
                          className="text-slate-600 hover:text-slate-900"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedClient && (
        <RetryPaymentDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedClient(null);
          }}
          onConfirm={handleRetryPayment}
          clientName={selectedClient.name}
          amount={selectedClient.outstandingPayment * 100}
          paymentMethods={[]} // This will be populated by the API call in handleRetryPayment
        />
      )}
    </div>
  );
} 