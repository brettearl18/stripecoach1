'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  CreditCard, 
  Users, 
  Activity, 
  Calendar,
  Shield,
  BarChart,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { getCompanyDetails } from '@/lib/services/companyService';
import { getCompanyAnalytics } from '@/lib/services/analyticsService';
import { useToast } from '@/components/ui/use-toast';

interface SubscriptionDetailsProps {
  params: {
    id: string;
  };
}

export default function SubscriptionDetailsPage({ params }: SubscriptionDetailsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companyData, subscriptionResponse, analyticsData] = await Promise.all([
        getCompanyDetails(params.id),
        fetch(`/api/company-subscription/${params.id}`),
        getCompanyAnalytics(params.id)
      ]);
      let subscriptionData = null;
      if (subscriptionResponse.ok) {
        subscriptionData = await subscriptionResponse.json();
      }
      setCompany(companyData);
      setSubscription(subscriptionData);
      setAnalytics(analyticsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load subscription details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription(params.id);
      await loadData();
      toast({
        title: 'Success',
        description: 'Subscription cancelled successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-background text-foreground">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/subscriptions"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{company?.name}</h1>
          <p className="text-muted-foreground">Subscription and company details</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Coaches
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.activeCoaches || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {subscription?.plan?.limits?.coaches || 'unlimited'} allowed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Clients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.activeClients || 0}</div>
            <p className="text-xs text-muted-foreground">
              of {subscription?.plan?.limits?.clients || 'unlimited'} allowed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${subscription?.plan?.price || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Next billing {subscription?.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Account Health
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscription?.status === 'active' ? (
                <span className="text-green-500">Good</span>
              ) : (
                <span className="text-red-500">At Risk</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on usage and payments
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Details about the company and their subscription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Contact Details</h4>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {company?.name}</p>
                    <p><strong>Email:</strong> {company?.email}</p>
                    <p><strong>Phone:</strong> {company?.phone || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Subscription Details</h4>
                  <div className="space-y-2">
                    <p><strong>Plan:</strong> {subscription?.plan?.name}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        subscription?.status === 'active'
                          ? 'bg-green-500/15 text-green-500'
                          : 'bg-red-500/15 text-red-500'
                      }`}>
                        {subscription?.status}
                      </span>
                    </p>
                    <p><strong>Started:</strong> {subscription?.currentPeriodStart ? new Date(subscription.currentPeriodStart).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Plan Features</h4>
                <ul className="grid gap-2 md:grid-cols-2">
                  {subscription?.plan?.features?.map((feature: string) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Usage Trends</CardTitle>
                <CardDescription>Last 30 days of activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center border rounded">
                  [Usage Graph Placeholder]
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Activity items would go here */}
                  <p className="text-muted-foreground text-center">No recent activity</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage billing information and view payment history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <CreditCard className="h-6 w-6" />
                  <div>
                    <p className="font-medium">Visa ending in {subscription?.paymentMethod?.last4}</p>
                    <p className="text-sm text-muted-foreground">Expires {subscription?.paymentMethod?.expMonth}/{subscription?.paymentMethod?.expYear}</p>
                  </div>
                </div>
                <Button variant="outline">Update</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Past invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Invoice list would go here */}
                <p className="text-muted-foreground text-center">No billing history available</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage</CardTitle>
              <CardDescription>Monitor your resource consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Usage metrics would go here */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Storage Used</span>
                    <span>2.1 GB of 5 GB</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div className="h-2 rounded-full bg-primary" style={{ width: '42%' }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Settings</CardTitle>
              <CardDescription>Manage your subscription preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cancel Subscription</h4>
                    <p className="text-sm text-muted-foreground">
                      This will cancel the subscription at the end of the current billing period
                    </p>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={subscription?.status !== 'active'}
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 