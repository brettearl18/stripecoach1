"use client";
import { UserGroupIcon, TrophyIcon, ChartBarIcon, StarIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowTrendingUpIcon, UserIcon, Cog6ToothIcon, BellIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function BusinessOverviewCard({ data, loading, error }) {
  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-4 min-h-[180px]">
      <div className="flex items-center gap-3 mb-2">
        <ChartBarIcon className="h-7 w-7 text-indigo-400" />
        <h2 className="text-lg font-semibold text-white">Business Overview (AI)</h2>
      </div>
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">Growth</span>
          <span className="text-lg font-bold text-green-400">{data?.growth || "0%"}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">Active Clients</span>
          <span className="text-lg font-bold text-blue-300">{data?.activeClients || 0}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">Churn</span>
          <span className="text-lg font-bold text-red-400">{data?.churn || "0%"}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">New Signups</span>
          <span className="text-lg font-bold text-yellow-300">{data?.newSignups || 0}</span>
        </div>
      </div>
      <div className="mt-2 text-white text-sm min-h-[40px]">
        {loading && <span>Loading AI summary...</span>}
        {error && <span className="text-red-400">{error}</span>}
        {!loading && !error && (data?.summary || "No summary available.")}
      </div>
      {data?.alerts && data.alerts.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-orange-400 text-sm">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>{data.alerts[0]}</span>
        </div>
      )}
    </section>
  );
}

function ClientOverviewCard({ data }) {
  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-4 min-h-[180px]">
      <div className="flex items-center gap-3 mb-2">
        <UserGroupIcon className="h-7 w-7 text-green-400" />
        <h2 className="text-lg font-semibold text-white">Client Overview (AI)</h2>
      </div>
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">Total Clients</span>
          <span className="text-lg font-bold text-blue-300">{data?.totalClients || 0}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">Active</span>
          <span className="text-lg font-bold text-green-400">{data?.active || 0}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">At Risk</span>
          <span className="text-lg font-bold text-red-400">{data?.atRisk || 0}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">New This Month</span>
          <span className="text-lg font-bold text-yellow-300">{data?.newClients || 0}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <span className="text-xs text-gray-400">Top Performers</span>
        <ul className="text-sm text-white">
          {(data?.topPerformers && data.topPerformers.length > 0) ? data.topPerformers.map((c, i) => (
            <li key={c.name || i} className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-400" />
              {c.name} <span className="text-xs text-gray-400 ml-1">({c.streak}-week streak)</span>
            </li>
          )) : <li className="text-gray-500">No top performers</li>}
        </ul>
      </div>
      <div className="flex items-center gap-2 mt-2 text-blue-400 text-sm">
        <ArrowTrendingUpIcon className="h-5 w-5" />
        <span>Engagement Trend: {data?.engagementTrend || "0%"}</span>
      </div>
    </section>
  );
}

function ClientOfTheWeekCard({ data }) {
  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-4 min-h-[180px]">
      <div className="flex items-center gap-3 mb-2">
        <TrophyIcon className="h-7 w-7 text-yellow-400" />
        <h2 className="text-lg font-semibold text-white">Client of the Week (AI)</h2>
      </div>
      {data?.name ? (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-xl">
            {data.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div>
            <span className="block text-white font-semibold text-lg">{data.name}</span>
            <span className="block text-yellow-300 text-sm">{data.achievement}</span>
          </div>
        </div>
      ) : <span className="text-gray-500">No client selected this week.</span>}
      <div className="text-gray-300 text-sm mt-2">{data?.summary || ""}</div>
    </section>
  );
}

function WinsLossesCard({ data }) {
  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-4 min-h-[180px]">
      <div className="flex items-center gap-3 mb-2">
        <CheckCircleIcon className="h-7 w-7 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Wins & Losses (AI)</h2>
      </div>
      <div>
        <span className="text-xs text-green-400 font-semibold">Wins</span>
        <ul className="text-sm text-green-300 list-disc ml-5">
          {(data?.wins && data.wins.length > 0) ? data.wins.map((w, i) => <li key={i}>{w}</li>) : <li className="text-gray-500">No wins</li>}
        </ul>
      </div>
      <div>
        <span className="text-xs text-red-400 font-semibold">Losses</span>
        <ul className="text-sm text-red-300 list-disc ml-5">
          {(data?.losses && data.losses.length > 0) ? data.losses.map((l, i) => <li key={i}>{l}</li>) : <li className="text-gray-500">No losses</li>}
        </ul>
      </div>
    </section>
  );
}

function WhatToFocusOnCard({ data }) {
  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-4 min-h-[180px]">
      <div className="flex items-center gap-3 mb-2">
        <ArrowTrendingUpIcon className="h-7 w-7 text-pink-400" />
        <h2 className="text-lg font-semibold text-white">What to Focus On (AI)</h2>
      </div>
      <ul className="text-sm text-pink-300 list-disc ml-5">
        {(data?.focus && data.focus.length > 0) ? data.focus.map((f, i) => <li key={i}>{f}</li>) : <li className="text-gray-500">No focus areas available.</li>}
      </ul>
    </section>
  );
}

function ClientsToCheckOnCard({ data }) {
  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-4 min-h-[180px]">
      <div className="flex items-center gap-3 mb-2">
        <ExclamationTriangleIcon className="h-7 w-7 text-red-400" />
        <h2 className="text-lg font-semibold text-white">Clients to Check On (AI)</h2>
      </div>
      <ul className="text-sm text-red-300 list-disc ml-5">
        {(data?.clients && data.clients.length > 0) ? data.clients.map((c, i) => (
          <li key={i}>
            <span className="font-semibold text-white">{c.name}</span> <span className="text-xs text-red-400 ml-1">({c.reason})</span>
          </li>
        )) : <li className="text-gray-500">No at-risk clients found.</li>}
      </ul>
    </section>
  );
}

function ClientsToPraiseCard({ data }) {
  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-4 min-h-[180px]">
      <div className="flex items-center gap-3 mb-2">
        <StarIcon className="h-7 w-7 text-orange-400" />
        <h2 className="text-lg font-semibold text-white">Clients to Praise (AI)</h2>
      </div>
      <ul className="text-sm text-orange-300 list-disc ml-5">
        {(data?.clients && data.clients.length > 0) ? data.clients.map((c, i) => (
          <li key={i}>
            <span className="font-semibold text-white">{c.name}</span> <span className="text-xs text-orange-400 ml-1">({c.reason})</span>
          </li>
        )) : <li className="text-gray-500">No clients to praise found.</li>}
      </ul>
    </section>
  );
}

export default function CoachDashboard() {
  const { user } = useAuth();
  const [businessData, setBusinessData] = useState({});
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessError, setBusinessError] = useState('');
  const [credits, setCredits] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Simulate fetching live data (replace with real fetch if available)
  const [clientData, setClientData] = useState(null);
  const [clientOfWeekData, setClientOfWeekData] = useState(null);
  const [winsLossesData, setWinsLossesData] = useState(null);
  const [focusData, setFocusData] = useState(null);
  const [checkOnData, setCheckOnData] = useState(null);
  const [praiseData, setPraiseData] = useState(null);

  useEffect(() => {
    async function fetchCoachData() {
      setBusinessLoading(true);
      setBusinessError('');
      try {
        const res = await fetch(`/api/coach-data?coachId=${user.uid}`);
        const data = await res.json();
        setBusinessData({ summary: data.aiInsights });
        setCredits(data.aiRefreshCredits ?? 3);
      } catch (e) {
        setBusinessError('Failed to load insights.');
      }
      setBusinessLoading(false);
    }
    if (user?.uid) fetchCoachData();
  }, [user?.uid]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setBusinessError('');
    try {
      const res = await fetch('/api/ai-insights/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId: user.uid,
          prompt: 'Give me a concise, high-level summary of my business performance for this week as a fitness coach. If you have no data, say so.',
        }),
      });
      const data = await res.json();
      if (data.result) {
        setBusinessData({ summary: data.result });
        setCredits(data.credits);
      } else {
        setBusinessError(data.error || 'Failed to refresh.');
      }
    } catch (e) {
      setBusinessError('Failed to refresh.');
    }
    setRefreshing(false);
  };

  return (
    <div className="p-6 md:p-10 w-full">
      <h1 className="text-2xl font-bold text-white mb-8">AI Insights Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        <div>
          <BusinessOverviewCard data={businessData} loading={businessLoading || refreshing} error={businessError} />
            <button
            onClick={handleRefresh}
            disabled={refreshing || credits <= 0}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
            {refreshing ? 'Refreshing...' : `Refresh AI Insights (${credits} left)`}
                    </button>
          {businessError && <div className="text-red-500 mt-2">{businessError}</div>}
        </div>
        <ClientOverviewCard data={clientData} />
        <ClientOfTheWeekCard data={clientOfWeekData} />
        <WinsLossesCard data={winsLossesData} />
        <WhatToFocusOnCard data={focusData} />
        <ClientsToCheckOnCard data={checkOnData} />
        <ClientsToPraiseCard data={praiseData} />
              </div>
    </div>
  );
} 