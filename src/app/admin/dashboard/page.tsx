'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  UsersIcon,
  CurrencyDollarIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { SparkLineChart, LineChart, BarChart, DonutChart } from '@tremor/react';
import { 
  getDashboardMetrics, 
  getCoachPerformance, 
  getClientAlerts, 
  getClientProgress,
  getSubscriptionMetrics,
  getAccountHealth,
  type DashboardMetrics,
  type CoachPerformance,
  type ClientAlert,
  type ClientProgress,
  type SubscriptionMetrics,
  type AccountHealth
} from '@/lib/services/adminDashboardService';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [coaches, setCoaches] = useState<CoachPerformance[]>([]);
  const [alerts, setAlerts] = useState<ClientAlert[]>([]);
  const [progress, setProgress] = useState<ClientProgress[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionMetrics | null>(null);
  const [accountHealth, setAccountHealth] = useState<AccountHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [
          metricsData, 
          coachData, 
          alertsData, 
          progressData,
          subscriptionData,
          healthData
        ] = await Promise.all([
          getDashboardMetrics(),
          getCoachPerformance(),
          getClientAlerts(),
          getClientProgress(),
          getSubscriptionMetrics(),
          getAccountHealth()
        ]);

        setMetrics(metricsData);
        setCoaches(coachData);
        setAlerts(alertsData);
        setProgress(progressData);
        setSubscriptions(subscriptionData);
        setAccountHealth(healthData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total Revenue',
      value: metrics?.totalRevenue.value ? `$${metrics.totalRevenue.value.toLocaleString()}` : '$0',
      change: metrics?.totalRevenue.change || '0%',
      icon: CurrencyDollarIcon,
      trend: metrics?.totalRevenue.trend || [],
      color: 'emerald',
      subtext: 'Monthly recurring revenue'
    },
    {
      title: 'Active Coaches',
      value: metrics?.activeCoaches.value?.toString() || '0',
      change: metrics?.activeCoaches.change || '0',
      icon: UsersIcon,
      trend: metrics?.activeCoaches.trend || [],
      color: 'blue',
      subtext: 'Total active coaches'
    },
    {
      title: 'Total Clients',
      value: metrics?.totalClients.value?.toString() || '0',
      change: metrics?.totalClients.change || '0',
      icon: UsersIcon,
      trend: metrics?.totalClients.trend || [],
      color: 'violet',
      subtext: 'Across all coaches'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-3xl -z-10" />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 text-lg">Platform overview and key metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metricCards.map((metric) => (
            <Card 
              key={metric.title} 
              className="relative overflow-hidden bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 p-6 group hover:border-gray-700/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${metric.color}-500/10`}>
                    <metric.icon className={`h-6 w-6 text-${metric.color}-500`} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {metric.change.includes('+') ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      metric.change.includes('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">{metric.value}</h3>
                <p className="text-gray-400 text-sm font-medium">{metric.title}</p>
                <p className="text-gray-500 text-xs mt-1">{metric.subtext}</p>
                <div className="mt-4 h-12">
                  <SparkLineChart
                    data={metric.trend.map((value, index) => ({ value, index }))}
                    categories={['value']}
                    index="index"
                    colors={[metric.color]}
                    showAnimation={true}
                    curveType="monotone"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Subscription Health */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="h-6 w-1 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-full" />
              Subscription Health
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Active Subscriptions</span>
                  <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {subscriptions?.activeSubscriptions || 0}
                </div>
              </div>
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">At Risk</span>
                  <ExclamationCircleIcon className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {subscriptions?.atRiskSubscriptions || 0}
                </div>
              </div>
            </div>
            <DonutChart
              data={[
                { name: 'Active', value: subscriptions?.activeSubscriptions || 0 },
                { name: 'At Risk', value: subscriptions?.atRiskSubscriptions || 0 },
                { name: 'Churned', value: subscriptions?.churnedSubscriptions || 0 }
              ]}
              category="value"
              index="name"
              colors={['emerald', 'amber', 'red']}
              className="h-60"
            />
          </Card>

          {/* Account Health */}
          <Card className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="h-6 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
              Account Health
            </h2>
            <div className="space-y-4">
              {accountHealth?.metrics.map((metric) => (
                <div key={metric.name} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                  <div>
                    <div className="text-white font-medium">{metric.name}</div>
                    <div className="text-gray-400 text-sm">{metric.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          metric.score >= 80 ? 'bg-emerald-500' :
                          metric.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${metric.score}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      metric.score >= 80 ? 'text-emerald-400' :
                      metric.score >= 60 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {metric.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Coach Leaderboard */}
        <Card className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="h-6 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
            Coach Leaderboard
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 text-sm border-b border-gray-800/50">
                  <th className="text-left pb-4 font-medium">Rank</th>
                  <th className="text-left pb-4 font-medium">Coach</th>
                  <th className="text-left pb-4 font-medium">Clients</th>
                  <th className="text-left pb-4 font-medium">Revenue</th>
                  <th className="text-left pb-4 font-medium">Completion Rate</th>
                  <th className="text-left pb-4 font-medium">Response Time</th>
                  <th className="text-left pb-4 font-medium">Health Score</th>
                  <th className="text-left pb-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {coaches.map((coach, index) => (
                  <tr key={coach.id} className="group hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 text-gray-400">#{index + 1}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                          {coach.name[0]}
                        </div>
                        <div>
                          <div className="text-white font-medium">{coach.name}</div>
                          <div className="text-gray-400 text-sm">{coach.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{coach.clients.active}</span>
                        <span className="text-gray-400 text-sm">of {coach.clients.total}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="text-white font-medium">${coach.revenue.toLocaleString()}</div>
                      <div className="text-gray-400 text-sm">Monthly</div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${coach.completionRate}%` }}
                          />
                        </div>
                        <span className="text-emerald-400 font-medium">{coach.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="text-white font-medium">{coach.responseTime}h</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          coach.healthScore >= 80 ? 'bg-emerald-500' :
                          coach.healthScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`} />
                        <span className="text-white font-medium">{coach.healthScore}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Alerts */}
        <Card className="bg-gray-900/50 backdrop-blur-lg border border-gray-800/50 p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="h-6 w-1 bg-gradient-to-b from-red-500 to-amber-500 rounded-full" />
            Recent Alerts
          </h2>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 bg-gray-800/30 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    alert.severity === 'high' ? 'bg-red-500/10 text-red-500' :
                    alert.severity === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    <BellIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{alert.title}</div>
                    <div className="text-gray-400 text-sm">{alert.description}</div>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">
                  {alert.timestamp}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 