'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getCoach, getClientsByCoach, type Coach, type Client } from '@/lib/services/firebaseService';
import {
  ChartBarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface CoachAnalytics {
  activeClients: number;
  totalRevenue: number;
  averageCompletionRate: number;
  averageResponseTime: number;
  clientProgress: {
    improving: number;
    steady: number;
    declining: number;
  };
  monthlyRevenue: {
    month: string;
    amount: number;
  }[];
  clientRetention: {
    month: string;
    rate: number;
  }[];
}

export default function CoachAnalytics() {
  const params = useParams();
  const coachId = params.id as string;
  const [coach, setCoach] = useState<Coach | null>(null);
  const [analytics, setAnalytics] = useState<CoachAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCoachData();
  }, [coachId]);

  const loadCoachData = async () => {
    try {
      setIsLoading(true);
      const coachData = await getCoach(coachId);
      if (coachData) {
        setCoach(coachData);
        const clients = await getClientsByCoach(coachId);
        
        // Calculate analytics (mock data for now)
        const analyticsData: CoachAnalytics = {
          activeClients: clients.length,
          totalRevenue: 24999.99,
          averageCompletionRate: 92,
          averageResponseTime: 24, // hours
          clientProgress: {
            improving: 18,
            steady: 5,
            declining: 2,
          },
          monthlyRevenue: [
            { month: 'Jan', amount: 5000 },
            { month: 'Feb', amount: 5500 },
            { month: 'Mar', amount: 6000 },
            { month: 'Apr', amount: 6500 },
            { month: 'May', amount: 7000 },
            { month: 'Jun', amount: 7500 },
          ],
          clientRetention: [
            { month: 'Jan', rate: 95 },
            { month: 'Feb', rate: 92 },
            { month: 'Mar', rate: 90 },
            { month: 'Apr', rate: 88 },
            { month: 'May', rate: 85 },
            { month: 'Jun', rate: 82 },
          ],
        };
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error loading coach data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F15] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading analytics...
        </div>
      </div>
    );
  }

  if (!coach || !analytics) {
    return (
      <div className="min-h-screen bg-[#0B0F15] flex items-center justify-center text-white">
        Coach not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F15] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{coach.name}</h1>
          <p className="text-gray-400">{coach.email}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1A1F2B] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <UserGroupIcon className="h-5 w-5 text-blue-400" />
              <div className="text-sm text-gray-400">Active Clients</div>
            </div>
            <div className="text-2xl font-semibold">{analytics.activeClients}</div>
          </div>

          <div className="bg-[#1A1F2B] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <CurrencyDollarIcon className="h-5 w-5 text-green-400" />
              <div className="text-sm text-gray-400">Total Revenue</div>
            </div>
            <div className="text-2xl font-semibold">${analytics.totalRevenue.toLocaleString()}</div>
          </div>

          <div className="bg-[#1A1F2B] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <ChartBarIcon className="h-5 w-5 text-yellow-400" />
              <div className="text-sm text-gray-400">Completion Rate</div>
            </div>
            <div className="text-2xl font-semibold">{analytics.averageCompletionRate}%</div>
          </div>

          <div className="bg-[#1A1F2B] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <ClockIcon className="h-5 w-5 text-purple-400" />
              <div className="text-sm text-gray-400">Avg Response Time</div>
            </div>
            <div className="text-2xl font-semibold">{analytics.averageResponseTime}h</div>
          </div>
        </div>

        {/* Client Progress */}
        <div className="bg-[#1A1F2B] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Client Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#2A303C] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
                <div className="text-sm text-gray-400">Improving</div>
              </div>
              <div className="text-2xl font-semibold">{analytics.clientProgress.improving}</div>
            </div>

            <div className="bg-[#2A303C] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="h-5 w-5 text-yellow-400" />
                <div className="text-sm text-gray-400">Steady</div>
              </div>
              <div className="text-2xl font-semibold">{analytics.clientProgress.steady}</div>
            </div>

            <div className="bg-[#2A303C] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowTrendingDownIcon className="h-5 w-5 text-red-400" />
                <div className="text-sm text-gray-400">Declining</div>
              </div>
              <div className="text-2xl font-semibold">{analytics.clientProgress.declining}</div>
            </div>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-[#1A1F2B] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.monthlyRevenue.map((data) => (
              <div key={data.month} className="flex-1">
                <div className="bg-blue-500/20 rounded-t-lg" style={{ height: `${(data.amount / 7500) * 100}%` }} />
                <div className="text-center text-sm text-gray-400 mt-2">{data.month}</div>
                <div className="text-center text-sm">${data.amount}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Retention Chart */}
        <div className="bg-[#1A1F2B] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Client Retention Rate</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.clientRetention.map((data) => (
              <div key={data.month} className="flex-1">
                <div className="bg-green-500/20 rounded-t-lg" style={{ height: `${data.rate}%` }} />
                <div className="text-center text-sm text-gray-400 mt-2">{data.month}</div>
                <div className="text-center text-sm">{data.rate}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 