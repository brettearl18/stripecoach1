'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Download, Filter } from 'lucide-react';
import Link from 'next/link';
import { getCompanies } from '@/lib/services/companyService';
import { generateRevenueReport } from '@/lib/services/billingService';
import { formatCurrency } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Company {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  coachCount: number;
  clientCount: number;
  createdAt: string;
  subscription?: {
    plan: string;
    status: string;
    startDate: string;
    endDate?: string;
  };
}

interface RevenueMetrics {
  totalRevenue: number;
  activeSubscriptions: number;
  averageSubscriptionValue: number;
  churnRate: number;
  revenueGrowth: number;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics | null>(null);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companiesData, revenueReport] = await Promise.all([
        getCompanies(),
        generateRevenueReport(
          new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
          new Date().toISOString()
        )
      ]);

      setCompanies(companiesData);
      setRevenueMetrics({
        totalRevenue: revenueReport.totalRevenue,
        activeSubscriptions: revenueReport.activeSubscriptions,
        averageSubscriptionValue: revenueReport.totalRevenue / revenueReport.activeSubscriptions,
        churnRate: (revenueReport.canceledSubscriptions / revenueReport.activeSubscriptions) * 100,
        revenueGrowth: ((revenueReport.totalRevenue - revenueReport.refundAmount) / revenueReport.totalRevenue) * 100
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = companies.filter(company => {
    if (filter === 'all') return true;
    if (filter === 'active') return company.status === 'active';
    if (filter === 'inactive') return company.status === 'inactive';
    return true;
  });

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
        <h1 className="text-3xl font-bold">Companies</h1>
        <div className="flex items-center gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/admin/companies/setup">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add New Company
            </Button>
          </Link>
        </div>
      </div>

      {revenueMetrics && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(revenueMetrics.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {revenueMetrics.revenueGrowth > 0 ? '+' : ''}{revenueMetrics.revenueGrowth.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenueMetrics.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">
                {revenueMetrics.churnRate.toFixed(1)}% churn rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Subscription Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(revenueMetrics.averageSubscriptionValue)}</div>
              <p className="text-xs text-muted-foreground">Per active subscription</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
              <p className="text-xs text-muted-foreground">
                {companies.filter(c => c.status === 'active').length} active
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Coaches</TableHead>
              <TableHead>Clients</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>{company.email}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      company.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {company.status}
                  </span>
                </TableCell>
                <TableCell>
                  {company.subscription?.plan || 'No Plan'}
                </TableCell>
                <TableCell>{company.coachCount}</TableCell>
                <TableCell>{company.clientCount}</TableCell>
                <TableCell>
                  {new Date(company.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link href={`/admin/companies/${company.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
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
} 