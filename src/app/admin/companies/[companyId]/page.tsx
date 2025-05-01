'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { getCompany, Company } from '@/lib/services/companyService';
import { getCompanySubscription } from '@/lib/services/subscriptionService';

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      const [companyData, subscriptionData] = await Promise.all([
        getCompany(companyId),
        getCompanySubscription(companyId)
      ]);

      if (!companyData) {
        throw new Error('Company not found');
      }

      setCompany(companyData);
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error loading company data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Company not found</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{company.name}</h1>
        <Button variant="outline">Edit Company</Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="coaches">Coaches</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-semibold">Email:</span> {company.email}
              </div>
              <div>
                <span className="font-semibold">Status:</span>
                <span className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {company.status}
                </span>
              </div>
              <div>
                <span className="font-semibold">Phone:</span> {company.contact?.phone || 'N/A'}
              </div>
              {company.contact?.address && (
                <div>
                  <span className="font-semibold">Address:</span>
                  <div className="ml-4">
                    <div>{company.contact.address.street}</div>
                    <div>{company.contact.address.city}, {company.contact.address.state} {company.contact.address.zip}</div>
                    <div>{company.contact.address.country}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Total Coaches</div>
                <div className="text-2xl font-bold">{company.coachCount}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Clients</div>
                <div className="text-2xl font-bold">{company.clientCount}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coaches">
          <Card>
            <CardHeader>
              <CardTitle>Coaches</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Coach list will be implemented here */}
              <div className="text-gray-500">Coach management coming soon...</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {subscription ? (
                <>
                  <div>
                    <span className="font-semibold">Plan:</span> {subscription.plan}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>
                    <span className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {subscription.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Start Date:</span>{' '}
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </div>
                  {subscription.endDate && (
                    <div>
                      <span className="font-semibold">End Date:</span>{' '}
                      {new Date(subscription.endDate).toLocaleDateString()}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-500">No active subscription</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 