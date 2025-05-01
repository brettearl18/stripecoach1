'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function BillingSection() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleManageBilling = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open billing portal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="bg-[#1a2234] border-[#2a3441]">
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription className="text-gray-400">Manage your subscription and billing details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-[#0f1729] border border-[#2a3441]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-sm font-medium text-white">Professional Plan</h3>
                  <p className="text-xs text-gray-400 mt-1">$49/month</p>
                </div>
                <Badge className="bg-blue-600">Active</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>Next billing date:</span>
                  <span className="text-white">March 24, 2024</span>
                </div>
                <Button
                  onClick={handleManageBilling}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? 'Loading...' : 'Manage Billing'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="bg-[#1a2234] border-[#2a3441]">
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription className="text-gray-400">Your saved payment methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-[#0f1729] border border-[#2a3441]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-12 bg-[#2a3441] rounded flex items-center justify-center">
                  <span className="text-xs text-white">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">•••• 4242</p>
                  <p className="text-xs text-gray-400">Expires 12/24</p>
                </div>
              </div>
              <Badge className="bg-green-600">Default</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="bg-[#1a2234] border-[#2a3441]">
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription className="text-gray-400">Your recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: 'Feb 24, 2024', amount: '$49.00', status: 'Paid', invoiceId: 'inv_123' },
              { date: 'Jan 24, 2024', amount: '$49.00', status: 'Paid', invoiceId: 'inv_456' },
              { date: 'Dec 24, 2023', amount: '$49.00', status: 'Paid', invoiceId: 'inv_789' }
            ].map((invoice) => (
              <div key={invoice.invoiceId} className="flex justify-between items-center p-3 rounded-lg bg-[#0f1729] border border-[#2a3441]">
                <div>
                  <p className="text-sm font-medium text-white">{invoice.date}</p>
                  <p className="text-xs text-gray-400">{invoice.amount}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-600">{invoice.status}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#0f1729] border-[#2a3441] hover:bg-[#2a3441] hover:text-white"
                    onClick={() => window.open(`/api/stripe/invoices/${invoice.invoiceId}`, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 