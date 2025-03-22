'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ClipboardDocumentCheckIcon, 
  ClockIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon 
} from '@heroicons/react/24/outline';
import { defaultTemplates } from '@/lib/data/form-templates';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface CheckIn {
  id: string;
  date: string;
  scores: {
    nutrition: number;
    training: number;
    mindset: number;
    sleep: number;
    measurements?: number;
  };
  overallScore: number;
  trend?: 'up' | 'down';
  trendValue?: number;
}

interface Metrics {
  latestScore: number;
  totalCheckIns: number;
  nextCheckIn: string;
}

export default function ClientCheckInPage() {
  const [activeTab, setActiveTab] = useState<'forms' | 'history'>('forms');
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCheckInData();
  }, []);

  const fetchCheckInData = async () => {
    try {
      const response = await fetch('/api/client/check-in');
      if (!response.ok) {
        throw new Error('Failed to fetch check-in data');
      }
      const data = await response.json();
      setCheckIns(data.checkIns);
      setMetrics(data.metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, trend = null, trendValue = null }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {trend && (
          <p className={`ml-2 flex items-baseline text-sm font-semibold ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
            <span className="sr-only">{trend === 'up' ? 'Increased' : 'Decreased'} by</span>
            {trendValue}%
          </p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Check-ins</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track your progress and complete your regular check-ins
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Latest Overall Score"
            value={`${metrics?.latestScore || 0}%`}
            trend={checkIns[0]?.trend}
            trendValue={checkIns[0]?.trendValue}
          />
          <MetricCard
            title="Check-ins Completed"
            value={metrics?.totalCheckIns || 0}
          />
          <MetricCard
            title="Next Check-in"
            value={metrics?.nextCheckIn || 'Today'}
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('forms')}
              className={`${
                activeTab === 'forms'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Available Forms
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Check-in History
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'forms' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {defaultTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">{template.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {template.categories.map((category) => (
                        <span
                          key={category}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4">
                    <ClipboardDocumentCheckIcon className="h-8 w-8 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-6">
                  <Link
                    href={`/client/check-in/${template.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Start Check-in
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg">
            <ul role="list" className="divide-y divide-gray-200">
              {checkIns.map((checkIn) => (
                <li key={checkIn.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ChartBarIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          Weekly Check-in
                        </h3>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <ClockIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                          <p>{new Date(checkIn.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Overall Score</p>
                        <p className="mt-1 text-lg font-semibold text-indigo-600">
                          {checkIn.overallScore}%
                        </p>
                      </div>
                      <Link
                        href={`/client/check-in/history/${checkIn.id}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-4">
                    {Object.entries(checkIn.scores)
                      .filter(([_, score]) => score !== null)
                      .map(([category, score]) => (
                        <div key={category} className="text-center">
                          <p className="text-sm font-medium text-gray-500 capitalize">
                            {category}
                          </p>
                          <p className="mt-1 text-lg font-semibold text-gray-900">
                            {score}%
                          </p>
                        </div>
                      ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 