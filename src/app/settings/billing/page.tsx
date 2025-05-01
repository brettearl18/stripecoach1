'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CreditCardIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

interface Invoice {
  id: string;
  amount_due: number;
  status: string;
  created: number;
}

export default function BillingSettings() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchBillingData = async () => {
      try {
        const [methodsRes, invoicesRes] = await Promise.all([
          fetch('/api/stripe/payment-methods'),
          fetch('/api/stripe/invoices')
        ]);

        if (!methodsRes.ok || !invoicesRes.ok) {
          throw new Error('Failed to fetch billing data');
        }

        const [methods, invoices] = await Promise.all([
          methodsRes.json(),
          invoicesRes.json()
        ]);

        setPaymentMethods(methods.data);
        setInvoices(invoices.data);
      } catch (error) {
        console.error('Error fetching billing data:', error);
        toast.error('Failed to load billing information');
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [user]);

  const handleUpdatePaymentMethod = async () => {
    // Implement Stripe payment method update
    toast.info('Payment method update not implemented');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white mb-6">Billing Settings</h1>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Payment Methods</CardTitle>
            <CardDescription className="text-gray-400">
              Manage your payment methods and billing information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg mb-4"
              >
                <div className="flex items-center space-x-4">
                  <CreditCardIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="text-white">
                      {method.card.brand.toUpperCase()} ending in {method.card.last4}
                    </p>
                    <p className="text-sm text-gray-400">
                      Expires {method.card.exp_month}/{method.card.exp_year}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleUpdatePaymentMethod}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Update
                </Button>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleUpdatePaymentMethod}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Add Payment Method
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Billing History</CardTitle>
            <CardDescription className="text-gray-400">
              View your past invoices and payment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg mb-4"
              >
                <div className="flex items-center space-x-4">
                  <DocumentTextIcon className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="text-white">
                      ${(invoice.amount_due / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-400">
                      {new Date(invoice.created * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    invoice.status === 'paid'
                      ? 'bg-green-900 text-green-300'
                      : 'bg-red-900 text-red-300'
                  }`}
                >
                  {invoice.status.toUpperCase()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 