'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { testClients, revenueData, metrics, businessInsights, healthMetrics, formatCurrency } from '@/lib/test-data';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ExclamationCircleIcon, 
  CheckCircleIcon, 
  ArrowDownTrayIcon,
  UsersIcon,
  BanknotesIcon,
  StarIcon,
  TrophyIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  MoonIcon,
  BoltIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useState } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export default function AdminDashboard() {
  const [timePeriod, setTimePeriod] = useState('weekly');
  
  // Add aggregated data calculations
  const getAggregatedData = (period) => {
    switch(period) {
      case 'weekly':
        return {
          labels: revenueData.daily.slice(-7).map(d => d.date),
          revenue: revenueData.daily.slice(-7).map(d => d.direct + d.affiliate),
          sessions: revenueData.daily.slice(-7).map(d => d.sessionsCompleted * 100),
        };
      case 'monthly':
        return {
          labels: revenueData.daily.slice(-30).map(d => d.date),
          revenue: revenueData.daily.slice(-30).map(d => d.direct + d.affiliate),
          sessions: revenueData.daily.slice(-30).map(d => d.sessionsCompleted * 100),
        };
      case 'yearly':
        return {
          labels: revenueData.daily.slice(-365).map(d => d.date),
          revenue: revenueData.daily.slice(-365).map(d => d.direct + d.affiliate),
          sessions: revenueData.daily.slice(-365).map(d => d.sessionsCompleted * 100),
        };
      default:
        return {
          labels: revenueData.daily.slice(-7).map(d => d.date),
          revenue: revenueData.daily.slice(-7).map(d => d.direct + d.affiliate),
          sessions: revenueData.daily.slice(-7).map(d => d.sessionsCompleted * 100),
        };
    }
  };

  const aggregatedData = getAggregatedData(timePeriod);

  const chartData = {
    labels: aggregatedData.labels,
    datasets: [
      {
        fill: true,
        label: 'Revenue',
        data: aggregatedData.revenue,
        borderColor: 'rgb(147, 197, 253)',
        backgroundColor: 'rgba(147, 197, 253, 0.1)',
        tension: 0.4,
      },
      {
        fill: true,
        label: 'Sessions',
        data: aggregatedData.sessions,
        borderColor: 'rgb(167, 139, 250)',
        backgroundColor: 'rgba(167, 139, 250, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 10,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'white',
        titleColor: 'black',
        bodyColor: 'black',
        borderColor: 'rgb(229, 231, 235)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: (value) => formatCurrency(Number(value)),
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  const today = new Date();
  const expiringClients = testClients
    .map(client => ({
      ...client,
      daysUntilExpiration: Math.ceil(
        (new Date(client.nextBilling).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      ),
    }))
    .filter(client => client.daysUntilExpiration <= 7);

  const clientsWithOutstanding = testClients.filter(client => client.outstandingPayment > 0);

  return (
    <div className="p-6 min-h-screen bg-slate-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-700">Health Coach Dashboard</h1>
        <button className="bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 transition-all duration-200">
          <span>Export to Excel</span>
        </button>
      </div>

      <div className="space-y-6">
        {/* Metrics Grid */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(16,24,40,0.08)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Active Clients"
              value={metrics.activeClients}
              trend={+15}
              icon={<UsersIcon className="w-6 h-6" />}
            />
            <MetricCard
              title="Monthly Revenue"
              value={formatCurrency(metrics.monthlyRevenue)}
              trend={+8.2}
              icon={<BanknotesIcon className="w-6 h-6" />}
            />
            <Link href="/admin/outstanding-payments" className="block">
              <MetricCard
                title="Outstanding Payments"
                value={formatCurrency(metrics.outstandingPayments)}
                trend={-5}
                icon={<ExclamationTriangleIcon className="w-6 h-6" />}
                isLink={true}
              />
            </Link>
            <MetricCard
              title="Client Satisfaction"
              value={metrics.clientSatisfaction.toFixed(1)}
              trend={+0.3}
              icon={<StarIcon className="w-6 h-6" />}
              suffix="/5"
            />
          </div>
        </div>

        {/* Health Monitoring Section */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(16,24,40,0.08)] p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Client Health Monitoring</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Averages */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500">Weekly Averages</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <HealthMetricCard
                  title="Stress Levels"
                  value={healthMetrics.weeklyAverages.stressLevels}
                  trend={healthMetrics.trends.stressLevels}
                  icon={<HeartIcon className="w-5 h-5 text-rose-500" />}
                  suffix="/10"
                  isInverse
                />
                <HealthMetricCard
                  title="Sleep Quality"
                  value={healthMetrics.weeklyAverages.sleepQuality}
                  trend={healthMetrics.trends.sleepQuality}
                  icon={<MoonIcon className="w-5 h-5 text-indigo-500" />}
                  suffix="/10"
                />
                <HealthMetricCard
                  title="Energy Levels"
                  value={healthMetrics.weeklyAverages.energyLevels}
                  trend={healthMetrics.trends.energyLevels}
                  icon={<BoltIcon className="w-5 h-5 text-yellow-500" />}
                  suffix="/10"
                />
              </div>
            </div>

            {/* Health Alerts */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-500">Health Alerts</h3>
              <div className="space-y-3">
                {healthMetrics.alerts.map((alert, index) => (
                  <HealthAlert
                    key={index}
                    clientName={alert.clientName}
                    metric={alert.metric}
                    value={alert.value}
                    threshold={alert.threshold}
                    priority={alert.priority}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Client Progress */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-500 mb-4">Client Progress</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Sleep</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Energy</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Exercise</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Water</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Mood</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {healthMetrics.clientProgress.map((client) => (
                    <tr key={client.clientId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {client.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ProgressBar
                          value={client.metrics.stressLevels[client.metrics.stressLevels.length - 1]}
                          goal={client.goals.stressLevels}
                          isInverse
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ProgressBar
                          value={client.metrics.sleepQuality[client.metrics.sleepQuality.length - 1]}
                          goal={client.goals.sleepQuality}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ProgressBar
                          value={client.metrics.energyLevels[client.metrics.energyLevels.length - 1]}
                          goal={client.goals.energyLevels}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ProgressBar
                          value={client.metrics.exerciseMinutes[client.metrics.exerciseMinutes.length - 1]}
                          goal={client.goals.exerciseMinutes}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ProgressBar
                          value={client.metrics.waterIntake[client.metrics.waterIntake.length - 1]}
                          goal={client.goals.waterIntake}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ProgressBar
                          value={client.metrics.moodScore[client.metrics.moodScore.length - 1]}
                          goal={client.goals.moodScore}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Charts and Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(16,24,40,0.08)] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-700">Revenue & Sessions Overview</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimePeriod('weekly')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    timePeriod === 'weekly'
                      ? 'bg-slate-100 text-slate-800'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimePeriod('monthly')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    timePeriod === 'monthly'
                      ? 'bg-slate-100 text-slate-800'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setTimePeriod('yearly')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                    timePeriod === 'yearly'
                      ? 'bg-slate-100 text-slate-800'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>
            <Line data={chartData} options={chartOptions} className="w-full h-[300px]" />
          </div>

          <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(16,24,40,0.08)] p-6">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Alerts</h2>
            <div className="space-y-4">
              <Alert
                title="Expiring Subscriptions"
                description="3 subscriptions expiring in the next 7 days"
                type="warning"
              />
              <Alert
                title="Outstanding Payments"
                description={`${clientsWithOutstanding.length} clients with pending payments`}
                type="error"
              />
            </div>
          </div>
        </div>

        {/* Business Insights */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(16,24,40,0.08)] p-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Business Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <InsightCard
              title="Wins"
              items={businessInsights.wins}
              icon={<TrophyIcon className="w-5 h-5 text-green-500" />}
            />
            <InsightCard
              title="Challenges"
              items={businessInsights.challenges}
              icon={<ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />}
            />
            <InsightCard
              title="Recommendations"
              items={businessInsights.recommendations}
              icon={<LightBulbIcon className="w-5 h-5 text-blue-500" />}
            />
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(16,24,40,0.08)] p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Active Clients</h2>
            <input
              type="text"
              placeholder="Search clients..."
              className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Session</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Goals</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {testClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/admin/clients/${client.id}`} className="flex items-center hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-full" src={client.avatar} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{client.name}</div>
                          <div className="text-sm text-slate-500">{client.email}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{client.lastSession}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{client.goals.join(', ')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{formatCurrency(client.revenue)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          className="bg-indigo-600 h-2.5 rounded-full"
                          style={{ width: `${client.progress}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, trend, icon, format = val => val.toString(), suffix = '', isLink = false }) {
  const isPositive = trend > 0;
  const textColor = isPositive ? 'text-emerald-600' : 'text-rose-400';
  
  return (
    <div className={`bg-white rounded-xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(16,24,40,0.08)] p-6 transition-all duration-200 hover:shadow-[0_4px_16px_-4px_rgba(16,24,40,0.12)] ${isLink ? 'cursor-pointer hover:border-slate-200' : ''}`}>
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-2 flex items-baseline">
        <div className="text-2xl font-semibold text-slate-700">{format(value)}</div>
        <div className={`ml-2 flex items-baseline text-sm font-semibold ${textColor}`}>
          {isPositive ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
          <span className="sr-only">{isPositive ? 'Increased' : 'Decreased'} by</span>
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="mt-2 flex items-baseline">
        <div className="text-2xl font-semibold text-slate-700">{suffix}</div>
      </div>
      <div className="mt-2 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      {isLink && (
        <div className="mt-2 text-xs text-slate-500 text-center">
          Click to view details
        </div>
      )}
    </div>
  );
}

function Alert({ title, description, type }) {
  const Icon = {
    warning: ExclamationCircleIcon,
    error: ExclamationCircleIcon,
  }[type];

  return (
    <div className="rounded-lg bg-amber-50 p-4">
      <div className="flex">
        <Icon className="h-5 w-5 text-amber-400" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-amber-800">{title}</h3>
          <div className="mt-2 text-sm text-amber-700">{description}</div>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ title, items, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <div className="text-sm font-medium text-gray-500">{title}</div>
      </div>
      <div className="space-y-4">
        {Array.isArray(items) ? (
          items.map((item, index) => (
            typeof item === 'string' ? (
              <div key={index} className="text-sm text-gray-600">
                {item}
              </div>
            ) : (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{item.metric}</span>
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{item.description}</span>
                  <span className={`${item.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {item.trend}
                  </span>
                </div>
              </div>
            )
          ))
        ) : (
          <div className="text-sm text-gray-600">No data available</div>
        )}
      </div>
    </div>
  );
}

function HealthMetricCard({ title, value, trend, icon, suffix = '', isInverse = false }) {
  const isPositive = isInverse ? trend < 0 : trend > 0;
  const textColor = isPositive ? 'text-emerald-600' : 'text-rose-400';
  
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(16,24,40,0.08)] p-4 transition-all duration-200 hover:shadow-[0_4px_16px_-4px_rgba(16,24,40,0.12)]">
      <div className="flex items-center gap-2">
        {icon}
        <div className="text-sm font-medium text-slate-500">{title}</div>
      </div>
      <div className="mt-2 flex items-baseline">
        <div className="text-xl font-semibold text-slate-700">{value.toFixed(1)}{suffix}</div>
        <div className={`ml-2 flex items-baseline text-sm font-semibold ${textColor}`}>
          {isPositive ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
          <span>{Math.abs(trend).toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}

function HealthAlert({ clientName, metric, value, threshold, priority }) {
  const colors = {
    high: 'bg-rose-50 text-rose-700 border-rose-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    low: 'bg-sky-50 text-sky-700 border-sky-100',
  };

  return (
    <div className={`rounded-xl border shadow-sm ${colors[priority]} transition-all duration-200 hover:shadow-md p-3`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-sm font-medium">{clientName}</h4>
          <p className="text-sm mt-1 opacity-90">{metric}: {value} (Threshold: {threshold})</p>
        </div>
        <ExclamationCircleIcon className="h-5 w-5 opacity-80" />
      </div>
    </div>
  );
}

function ProgressBar({ value, goal, isInverse = false }) {
  const progress = Math.min((value / goal) * 100, 100);
  const getColor = () => {
    if (isInverse) {
      return value <= goal ? 'bg-emerald-400' : 'bg-rose-300';
    }
    return value >= goal ? 'bg-emerald-400' : 'bg-sky-300';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-grow bg-slate-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 whitespace-nowrap">{value}/{goal}</span>
    </div>
  );
} 