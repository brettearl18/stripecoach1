'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Download } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  Invoice,
  Payment,
  Subscription,
  RegionalPrice,
  RevenueReport,
  getCompanyInvoices,
  getCompanyPayments,
  getRegionalPrices,
  generateRevenueReport,
  processRefund,
} from '@/lib/services/billingService';

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [regionalPrices, setRegionalPrices] = useState<RegionalPrice[]>([]);
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case 'invoices':
          const invoiceData = await getCompanyInvoices('vana-health-id');
          setInvoices(invoiceData);
          break;
        case 'payments':
          const paymentData = await getCompanyPayments('vana-health-id');
          setPayments(paymentData);
          break;
        case 'pricing':
          const priceData = await getRegionalPrices('default-plan');
          setRegionalPrices(priceData);
          break;
        case 'reports':
          const now = new Date();
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
          const report = await generateRevenueReport(startOfMonth, now.toISOString());
          setRevenueReport(report);
          break;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load billing data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (paymentId: string, amount: number) => {
    try {
      await processRefund({
        paymentId,
        amount,
        reason: 'requested_by_customer',
      });
      toast({
        title: 'Success',
        description: 'Refund processed successfully',
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process refund',
        variant: 'destructive',
      });
    }
  };

  const renderInvoicesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <Button>Create Invoice</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>{invoice.companyId}</TableCell>
                <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      invoice.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === 'sent'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      Send
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Payments</h2>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Invoice #</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.transactionId}</TableCell>
                <TableCell>{payment.invoiceId}</TableCell>
                <TableCell>{formatCurrency(payment.amount)}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      payment.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : payment.status === 'refunded'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {payment.status}
                  </span>
                </TableCell>
                <TableCell>{payment.paymentMethod}</TableCell>
                <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={payment.status !== 'completed'}
                      onClick={() => handleRefund(payment.id, payment.amount)}
                    >
                      Refund
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderPricingTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Regional Pricing</h2>
        <Button>Add Region</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Region</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {regionalPrices.map((price) => (
              <TableRow key={price.id}>
                <TableCell className="font-medium">{price.region}</TableCell>
                <TableCell>{price.currency}</TableCell>
                <TableCell>{formatCurrency(price.amount)}</TableCell>
                <TableCell>{price.interval}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">Revenue Report</h2>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
      {revenueReport && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(revenueReport.totalRevenue)}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Net Revenue</h3>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(revenueReport.netRevenue)}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Refunds</h3>
            <p className="mt-2 text-2xl font-bold">{formatCurrency(revenueReport.refundAmount)}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">New Subscriptions</h3>
            <p className="mt-2 text-2xl font-bold">{revenueReport.newSubscriptions}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Canceled Subscriptions</h3>
            <p className="mt-2 text-2xl font-bold">{revenueReport.canceledSubscriptions}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Active Subscriptions</h3>
            <p className="mt-2 text-2xl font-bold">{revenueReport.activeSubscriptions}</p>
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Billing Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="pricing">Regional Pricing</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices">{renderInvoicesTab()}</TabsContent>
        <TabsContent value="payments">{renderPaymentsTab()}</TabsContent>
        <TabsContent value="pricing">{renderPricingTab()}</TabsContent>
        <TabsContent value="reports">{renderReportsTab()}</TabsContent>
      </Tabs>
    </div>
  );
} 