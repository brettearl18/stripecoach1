import { Suspense } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SubscriptionTable from '@/components/dashboard/SubscriptionTable';
import AnalyticsCards from '@/components/dashboard/AnalyticsCards';
import RevenueChart from '@/components/dashboard/RevenueChart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingSpinner />}>
          <AnalyticsCards />
        </Suspense>

        <div className="mt-8">
          <Suspense fallback={<LoadingSpinner />}>
            <RevenueChart />
          </Suspense>
        </div>

        <div className="mt-8">
          <Suspense fallback={<LoadingSpinner />}>
            <SubscriptionTable />
          </Suspense>
        </div>
      </main>
    </div>
  );
} 