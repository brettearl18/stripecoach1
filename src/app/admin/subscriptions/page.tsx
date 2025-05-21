'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Loader2, Search, Filter, RefreshCw, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCompanies } from '@/lib/services/companyService';
import { Plan, getPlans, cancelSubscription, updateSubscription } from '@/lib/services/subscriptionService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompanyWithSubscription {
  id: string;
  name: string;
  email: string;
  subscription: {
    planId: string;
    status: string;
    currentPeriodEnd: string;
  } | null;
}

export default function SubscriptionsPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyWithSubscription[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<CompanyWithSubscription[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, statusFilter, planFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companiesData, plansData] = await Promise.all([
        getCompanies(),
        getPlans()
      ]);

      const companiesWithSubs = await Promise.all(
        companiesData.map(async (company) => {
          let subscription = null;
          try {
            const response = await fetch(`/api/company-subscription/${company.id}`);
            if (response.ok) {
              subscription = await response.json();
            }
          } catch (e) {
            subscription = null;
          }
          return {
            ...company,
            subscription: subscription ? {
              planId: subscription.planId,
              status: subscription.status,
              currentPeriodEnd: subscription.currentPeriodEnd,
            } : null,
          };
        })
      );

      setCompanies(companiesWithSubs);
      setPlans(plansData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load subscription data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCompanies = () => {
    let filtered = [...companies];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => 
        company.subscription?.status === statusFilter
      );
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(company => 
        company.subscription?.planId === planFilter
      );
    }

    setFilteredCompanies(filtered);
  };

  const getPlanName = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.name : 'Unknown Plan';
  };

  const handleCancelSubscription = async (companyId: string) => {
    try {
      setActionLoading(companyId);
      await cancelSubscription(companyId);
      await loadData(); // Refresh data
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
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (companyId: string) => {
    router.push(`/admin/subscriptions/${companyId}`);
  };

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-background text-foreground min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground mt-2">Manage company subscriptions and billing</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => loadData()}
          disabled={loading}
          className="hover:bg-accent"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {companies.filter(c => c.subscription?.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active subscriptions
            </p>
          </CardContent>
        </Card>
        {/* Add more summary cards as needed */}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-background border-border"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={planFilter}
              onValueChange={setPlanFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="font-medium">Company</TableHead>
                  <TableHead className="font-medium">Email</TableHead>
                  <TableHead className="font-medium">Plan</TableHead>
                  <TableHead className="font-medium">Status</TableHead>
                  <TableHead className="font-medium">Renewal Date</TableHead>
                  <TableHead className="font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={6} 
                      className="text-center py-8 text-muted-foreground"
                    >
                      No subscriptions found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCompanies.map((company) => (
                    <TableRow key={company.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell className="text-muted-foreground">{company.email}</TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {company.subscription 
                            ? getPlanName(company.subscription.planId)
                            : 'No Plan'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            !company.subscription
                              ? 'bg-secondary text-secondary-foreground'
                              : company.subscription.status === 'active'
                              ? 'bg-green-500/15 text-green-500'
                              : company.subscription.status === 'canceled'
                              ? 'bg-red-500/15 text-red-500'
                              : 'bg-yellow-500/15 text-yellow-500'
                          }`}
                        >
                          {company.subscription?.status || 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {company.subscription?.currentPeriodEnd
                          ? new Date(company.subscription.currentPeriodEnd).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(company.id)}
                            className="hover:bg-accent"
                          >
                            View Details
                          </Button>
                          {company.subscription?.status === 'active' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelSubscription(company.id)}
                              disabled={actionLoading === company.id}
                              className="hover:bg-destructive/90"
                            >
                              {actionLoading === company.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Cancel'
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 