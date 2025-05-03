"use client";
import Link from 'next/link';
import { UserGroupIcon, TrophyIcon, ChartBarIcon, StarIcon, ExclamationTriangleIcon, CheckCircleIcon, ArrowTrendingUpIcon, UserIcon, Cog6ToothIcon, BellIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

// ================= UI/UX TEAM START HERE =================
// TODO: Redesign this dashboard for a clean, professional, full-screen experience.
// - Feel free to refactor layout, add sidebar/topbar, cards, charts, tabs, etc.
// - Apply brand colors, fonts, spacing, and responsive design.
// - Replace placeholder sections with real UI elements, charts, or tables.
// - Integrate with a design system (e.g., Tailwind, Material UI) or custom components.
// - Add animations, interactions, and polish for a premium feel.
// - No backend logic here—focus 100% on UI/UX!
// =========================================================

function BusinessOverviewCard() {
  // Simulate loading and data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Simulate async fetch
    setTimeout(() => {
      // Uncomment to simulate error: setError(true)
      setData({
        growth: '+8% MoM',
        activeClients: 42,
        churn: '2%',
        newSignups: 7,
        alerts: ['Churn rate increased by 0.5% this week'],
        trend: 'up',
      });
      setLoading(false);
    }, 1200);
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 animate-pulse min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <ChartBarIcon className="h-7 w-7 text-indigo-400" />
          <h2 className="text-lg font-semibold">Business Overview (AI)</h2>
        </div>
        <div className="h-4 bg-gray-800 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-800 rounded w-1/3 mb-1" />
        <div className="h-3 bg-gray-800 rounded w-1/4" />
      </section>
    );
  }
  if (error) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <ChartBarIcon className="h-7 w-7 text-indigo-400" />
          <h2 className="text-lg font-semibold">Business Overview (AI)</h2>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <ExclamationCircleIcon className="h-5 w-5" />
          <span>Error loading business data.</span>
        </div>
      </section>
    );
  }
  if (!data) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <ChartBarIcon className="h-7 w-7 text-indigo-400" />
          <h2 className="text-lg font-semibold">Business Overview (AI)</h2>
        </div>
        <span className="text-gray-500">No business data available.</span>
      </section>
    );
  }
  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-4 min-h-[180px]">
      <div className="flex items-center gap-3 mb-2">
        <ChartBarIcon className="h-7 w-7 text-indigo-400" />
        <h2 className="text-lg font-semibold">Business Overview (AI)</h2>
      </div>
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">Growth</span>
          <span className="text-lg font-bold text-green-400">{data.growth}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">Active Clients</span>
          <span className="text-lg font-bold text-blue-300">{data.activeClients}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">Churn</span>
          <span className="text-lg font-bold text-red-400">{data.churn}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">New Signups</span>
          <span className="text-lg font-bold text-yellow-300">{data.newSignups}</span>
        </div>
      </div>
      {data.alerts && data.alerts.length > 0 && (
        <div className="mt-2 flex items-center gap-2 text-orange-400 text-sm">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <span>{data.alerts[0]}</span>
        </div>
      )}
    </section>
  );
}

function ClientOverviewCard() {
  // Simulate loading and data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      // Uncomment to simulate error: setError(true)
      setData({
        totalClients: 52,
        active: 42,
        atRisk: 3,
        newClients: 4,
        topPerformers: [
          { name: 'Alex J.', streak: 6 },
          { name: 'Sam P.', streak: 5 },
        ],
        engagementTrend: '+5% this month',
      });
      setLoading(false);
    }, 1200);
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 animate-pulse min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <UserGroupIcon className="h-7 w-7 text-green-400" />
          <h2 className="text-lg font-semibold">Client Overview (AI)</h2>
        </div>
        <div className="h-4 bg-gray-800 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-800 rounded w-1/3 mb-1" />
        <div className="h-3 bg-gray-800 rounded w-1/4" />
      </section>
    );
  }
  if (error) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <UserGroupIcon className="h-7 w-7 text-green-400" />
          <h2 className="text-lg font-semibold">Client Overview (AI)</h2>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <ExclamationCircleIcon className="h-5 w-5" />
          <span>Error loading client data.</span>
        </div>
      </section>
    );
  }
  if (!data) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <UserGroupIcon className="h-7 w-7 text-green-400" />
          <h2 className="text-lg font-semibold">Client Overview (AI)</h2>
        </div>
        <span className="text-gray-500">No client data available.</span>
      </section>
    );
  }
  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-4 min-h-[180px]">
      <div className="flex items-center gap-3 mb-2">
        <UserGroupIcon className="h-7 w-7 text-green-400" />
        <h2 className="text-lg font-semibold">Client Overview (AI)</h2>
      </div>
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">Total Clients</span>
          <span className="text-lg font-bold text-blue-300">{data.totalClients}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">Active</span>
          <span className="text-lg font-bold text-green-400">{data.active}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">At Risk</span>
          <span className="text-lg font-bold text-red-400">{data.atRisk}</span>
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-400">New This Month</span>
          <span className="text-lg font-bold text-yellow-300">{data.newClients}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <span className="text-xs text-gray-400">Top Performers</span>
        <ul className="text-sm text-white">
          {data.topPerformers.map((c: any) => (
            <li key={c.name} className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4 text-green-400" />
              {c.name} <span className="text-xs text-gray-400 ml-1">({c.streak}-week streak)</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center gap-2 mt-2 text-blue-400 text-sm">
        <ArrowTrendingUpIcon className="h-5 w-5" />
        <span>Engagement Trend: {data.engagementTrend}</span>
      </div>
    </section>
  );
}

function ClientOfTheWeekCard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      // Uncomment to simulate error: setError(true)
      setData({
        name: 'Jordan Smith',
        achievement: 'Completed 8-week streak',
        summary: 'Jordan has shown outstanding consistency and hit a major milestone this week. Keep up the great work!',
        avatar: null, // Could add avatar URL if desired
      });
      setLoading(false);
    }, 1200);
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 animate-pulse min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <TrophyIcon className="h-7 w-7 text-yellow-400" />
          <h2 className="text-lg font-semibold">Client of the Week (AI)</h2>
        </div>
        <div className="h-4 bg-gray-800 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-800 rounded w-1/3 mb-1" />
        <div className="h-3 bg-gray-800 rounded w-1/4" />
      </section>
    );
  }
  if (error) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <TrophyIcon className="h-7 w-7 text-yellow-400" />
          <h2 className="text-lg font-semibold">Client of the Week (AI)</h2>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <ExclamationCircleIcon className="h-5 w-5" />
          <span>Error loading client highlight.</span>
        </div>
      </section>
    );
  }
  if (!data) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <TrophyIcon className="h-7 w-7 text-yellow-400" />
          <h2 className="text-lg font-semibold">Client of the Week (AI)</h2>
        </div>
        <span className="text-gray-500">No client selected this week.</span>
      </section>
    );
  }
  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-4 min-h-[180px]">
      <div className="flex items-center gap-3 mb-2">
        <TrophyIcon className="h-7 w-7 text-yellow-400" />
        <h2 className="text-lg font-semibold">Client of the Week (AI)</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-xl">
          {data.name.split(' ').map((n: string) => n[0]).join('')}
        </div>
        <div>
          <span className="block text-white font-semibold text-lg">{data.name}</span>
          <span className="block text-yellow-300 text-sm">{data.achievement}</span>
        </div>
      </div>
      <div className="text-gray-300 text-sm mt-2">{data.summary}</div>
    </section>
  );
}

function WinsLossesCard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setData({
        wins: [
          '80% of clients hit their protein targets',
          'Average step count increased by 2,000 steps',
        ],
        losses: [
          '3 clients missed check-ins',
          'Nutrition adherence dropped 10%',
        ],
      });
      setLoading(false);
    }, 1200);
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 animate-pulse min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircleIcon className="h-7 w-7 text-blue-400" />
          <h2 className="text-lg font-semibold">Wins & Losses (AI)</h2>
        </div>
        <div className="h-4 bg-gray-800 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-800 rounded w-1/3 mb-1" />
        <div className="h-3 bg-gray-800 rounded w-1/4" />
      </section>
    );
  }
  if (error) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircleIcon className="h-7 w-7 text-blue-400" />
          <h2 className="text-lg font-semibold">Wins & Losses (AI)</h2>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <ExclamationCircleIcon className="h-5 w-5" />
          <span>Error loading wins/losses.</span>
        </div>
      </section>
    );
  }
  if (!data) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircleIcon className="h-7 w-7 text-blue-400" />
          <h2 className="text-lg font-semibold">Wins & Losses (AI)</h2>
        </div>
        <span className="text-gray-500">No data available.</span>
      </section>
    );
  }
  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-4 min-h-[180px]">
      <div className="flex items-center gap-3 mb-2">
        <CheckCircleIcon className="h-7 w-7 text-blue-400" />
        <h2 className="text-lg font-semibold">Wins & Losses (AI)</h2>
      </div>
      <div>
        <span className="text-xs text-green-400 font-semibold">Wins</span>
        <ul className="text-sm text-green-300 list-disc ml-5">
          {data.wins.map((w: string, i: number) => <li key={i}>{w}</li>)}
        </ul>
      </div>
      <div>
        <span className="text-xs text-red-400 font-semibold">Losses</span>
        <ul className="text-sm text-red-300 list-disc ml-5">
          {data.losses.map((l: string, i: number) => <li key={i}>{l}</li>)}
        </ul>
      </div>
    </section>
  );
}

function WhatToFocusOnCard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setData({
        focus: [
          'Increase check-in completion rate',
          'Address nutrition adherence drop',
          'Encourage more peer support in group chat',
        ],
      });
      setLoading(false);
    }, 1200);
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 animate-pulse min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <ArrowTrendingUpIcon className="h-7 w-7 text-pink-400" />
          <h2 className="text-lg font-semibold">What to Focus On (AI)</h2>
        </div>
        <div className="h-4 bg-gray-800 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-800 rounded w-1/3 mb-1" />
        <div className="h-3 bg-gray-800 rounded w-1/4" />
      </section>
    );
  }
  if (error) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <ArrowTrendingUpIcon className="h-7 w-7 text-pink-400" />
          <h2 className="text-lg font-semibold">What to Focus On (AI)</h2>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <ExclamationCircleIcon className="h-5 w-5" />
          <span>Error loading focus areas.</span>
        </div>
      </section>
    );
  }
  if (!data) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <ArrowTrendingUpIcon className="h-7 w-7 text-pink-400" />
          <h2 className="text-lg font-semibold">What to Focus On (AI)</h2>
        </div>
        <span className="text-gray-500">No focus areas available.</span>
      </section>
    );
  }
  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-4 min-h-[180px]">
      <div className="flex items-center gap-3 mb-2">
        <ArrowTrendingUpIcon className="h-7 w-7 text-pink-400" />
        <h2 className="text-lg font-semibold">What to Focus On (AI)</h2>
      </div>
      <ul className="text-sm text-pink-300 list-disc ml-5">
        {data.focus.map((f: string, i: number) => <li key={i}>{f}</li>)}
      </ul>
    </section>
  );
}

function ClientsToCheckOnCard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setData({
        clients: [
          { name: 'Taylor R.', reason: 'Missed 2 check-ins' },
          { name: 'Morgan K.', reason: 'Low mood reported' },
        ],
      });
      setLoading(false);
    }, 1200);
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 animate-pulse min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <ExclamationTriangleIcon className="h-7 w-7 text-red-400" />
          <h2 className="text-lg font-semibold">Clients to Check On (AI)</h2>
        </div>
        <div className="h-4 bg-gray-800 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-800 rounded w-1/3 mb-1" />
        <div className="h-3 bg-gray-800 rounded w-1/4" />
      </section>
    );
  }
  if (error) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <ExclamationTriangleIcon className="h-7 w-7 text-red-400" />
          <h2 className="text-lg font-semibold">Clients to Check On (AI)</h2>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <ExclamationCircleIcon className="h-5 w-5" />
          <span>Error loading at-risk clients.</span>
        </div>
      </section>
    );
  }
  if (!data) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <ExclamationTriangleIcon className="h-7 w-7 text-red-400" />
          <h2 className="text-lg font-semibold">Clients to Check On (AI)</h2>
        </div>
        <span className="text-gray-500">No at-risk clients found.</span>
      </section>
    );
  }
  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-4 min-h-[180px]">
      <div className="flex items-center gap-3 mb-2">
        <ExclamationTriangleIcon className="h-7 w-7 text-red-400" />
        <h2 className="text-lg font-semibold">Clients to Check On (AI)</h2>
      </div>
      <ul className="text-sm text-red-300 list-disc ml-5">
        {data.clients.map((c: any, i: number) => (
          <li key={i}>
            <span className="font-semibold text-white">{c.name}</span> <span className="text-xs text-red-400 ml-1">({c.reason})</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ClientsToPraiseCard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setData({
        clients: [
          { name: 'Jamie L.', reason: 'Hit 4-week streak' },
          { name: 'Chris D.', reason: 'Achieved weight goal' },
        ],
      });
      setLoading(false);
    }, 1200);
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 animate-pulse min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <StarIcon className="h-7 w-7 text-orange-400" />
          <h2 className="text-lg font-semibold">Clients to Praise (AI)</h2>
        </div>
        <div className="h-4 bg-gray-800 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-800 rounded w-1/3 mb-1" />
        <div className="h-3 bg-gray-800 rounded w-1/4" />
      </section>
    );
  }
  if (error) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <StarIcon className="h-7 w-7 text-orange-400" />
          <h2 className="text-lg font-semibold">Clients to Praise (AI)</h2>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <ExclamationCircleIcon className="h-5 w-5" />
          <span>Error loading praise clients.</span>
        </div>
      </section>
    );
  }
  if (!data) {
    return (
      <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-2 min-h-[180px]">
        <div className="flex items-center gap-3 mb-2">
          <StarIcon className="h-7 w-7 text-orange-400" />
          <h2 className="text-lg font-semibold">Clients to Praise (AI)</h2>
        </div>
        <span className="text-gray-500">No clients to praise found.</span>
      </section>
    );
  }
  return (
    <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800 flex flex-col gap-4 min-h-[180px]">
      <div className="flex items-center gap-3 mb-2">
        <StarIcon className="h-7 w-7 text-orange-400" />
        <h2 className="text-lg font-semibold">Clients to Praise (AI)</h2>
      </div>
      <ul className="text-sm text-orange-300 list-disc ml-5">
        {data.clients.map((c: any, i: number) => (
          <li key={i}>
            <span className="font-semibold text-white">{c.name}</span> <span className="text-xs text-orange-400 ml-1">({c.reason})</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function CoachDashboardV2() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 via-gray-950 to-gray-800">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-950 border-r border-gray-800 p-6 space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <ChartBarIcon className="h-8 w-8 text-indigo-500" />
          <span className="text-2xl font-bold text-white tracking-tight">Coach Portal</span>
        </div>
        <nav className="flex flex-col gap-4">
          <Link href="/coach/dashboardv2" className="text-indigo-400 font-semibold hover:text-indigo-300">AI Dashboard</Link>
          <Link href="/coach/dashboard" className="text-gray-400 hover:text-white">Classic Dashboard</Link>
          <Link href="/coach/clients" className="text-gray-400 hover:text-white">Clients</Link>
          <Link href="/coach/check-ins" className="text-gray-400 hover:text-white">Check-Ins</Link>
          <Link href="/coach/analytics" className="text-gray-400 hover:text-white">Analytics</Link>
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <Link href="/coach/settings" className="flex items-center gap-2 text-gray-500 hover:text-white text-sm">
            <Cog6ToothIcon className="h-5 w-5" /> Settings
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">AI Insights Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-400 hover:text-white">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-950"></span>
            </button>
            <button className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1 text-sm text-white hover:bg-gray-700">
              <UserIcon className="h-5 w-5" /> Coach
            </button>
          </div>
        </header>

        {/* Dashboard Grid - now full width */}
        <main className="flex-1 p-6 md:p-10 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-800 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {/* Business Overview (AI) */}
            <BusinessOverviewCard />

            {/* Client Overview (AI) */}
            <ClientOverviewCard />

            {/* Client of the Week (AI) */}
            <ClientOfTheWeekCard />

            {/* Wins & Losses (AI) */}
            <WinsLossesCard />

            {/* What to Focus On (AI) */}
            <WhatToFocusOnCard />

            {/* Clients to Check On (AI) */}
            <ClientsToCheckOnCard />

            {/* Clients to Praise (AI) */}
            <ClientsToPraiseCard />
          </div>
        </main>
      </div>
    </div>
  );
} 