'use client';

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  UserIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowTrendingDownIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { getCoaches, getClientsByCoach } from '@/lib/services/firebaseService';
import type { Coach } from '@/types/coach';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  ArcElement
} from 'chart.js';
import { Line, Radar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  ArcElement
);

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface CoachSummary {
  id: string;
  name: string;
  email: string;
  metrics: {
    activeClients: number;
    totalRevenue: number;
    completionRate: number;
    responseTime: number;
    clientProgress: {
      improving: number;
      steady: number;
      declining: number;
    };
    monthlyTrend: {
      revenue: number;
      clients: number;
      satisfaction: number;
    };
  };
}

interface Achievement {
  clientName: string;
  coachName: string;
  achievement: string;
  date: string;
  type: 'weight' | 'completion' | 'streak' | 'milestone';
  metric?: string;
}

interface AtRiskClient {
  clientName: string;
  coachName: string;
  riskLevel: 'high' | 'medium' | 'low';
  reason: string;
  lastActive: string;
  trend: 'down' | 'up';
  metric: string;
}

function CoachSummaries() {
  const [coachSummaries, setCoachSummaries] = useState<CoachSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('month');

  useEffect(() => {
    loadCoachData();
  }, []);

  const loadCoachData = async () => {
    try {
      setIsLoading(true);
      const coaches = await getCoaches();
      
      const summaries = await Promise.all(
        coaches.map(async (coach) => {
          const clients = await getClientsByCoach(coach.id!);
          
          // Calculate metrics based on actual client data
          const activeClients = clients.length;
          const totalRevenue = activeClients * 199; // $199 per client

          // Calculate average completion rate and response time from client metrics
          const completionRates = clients.map(client => client.metrics?.completionRate || 0);
          const avgCompletionRate = completionRates.length > 0 
            ? Math.round(completionRates.reduce((a, b) => a + b, 0) / completionRates.length * 100)
            : 0;

          // Calculate response time (average of last check-in times)
          const now = new Date();
          const responseTimes = clients
            .map(client => {
              const lastCheckIn = client.metrics?.lastCheckIn;
              if (!lastCheckIn) return 0;
              const checkInDate = new Date(lastCheckIn);
              return Math.round((now.getTime() - checkInDate.getTime()) / (1000 * 60 * 60)); // hours
            })
            .filter(time => time > 0);
          
          const avgResponseTime = responseTimes.length > 0
            ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
            : 0;

          // Calculate client progress based on consistency scores
          const improving = clients.filter(client => (client.metrics?.consistency || 0) >= 75).length;
          const steady = clients.filter(client => {
            const consistency = client.metrics?.consistency || 0;
            return consistency >= 40 && consistency < 75;
          }).length;
          const declining = clients.filter(client => (client.metrics?.consistency || 0) < 40).length;

          // Calculate monthly trends
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          
          const thisMonthClients = clients.filter(client => {
            const createdAt = new Date(client.createdAt);
            return createdAt >= monthStart;
          }).length;

          const lastMonthClients = clients.filter(client => {
            const createdAt = new Date(client.createdAt);
            return createdAt >= lastMonthStart && createdAt < monthStart;
          }).length;

          const clientTrend = lastMonthClients > 0 
            ? Math.round(((thisMonthClients - lastMonthClients) / lastMonthClients) * 100)
            : 0;

          return {
            id: coach.id!,
            name: coach.name,
            email: coach.email,
            metrics: {
              activeClients,
              totalRevenue,
              completionRate: avgCompletionRate,
              responseTime: avgResponseTime,
              clientProgress: {
                improving,
                steady,
                declining,
              },
              monthlyTrend: {
                revenue: clientTrend, // Revenue trend follows client trend
                clients: clientTrend,
                satisfaction: Math.round(avgCompletionRate / 10) // Satisfaction based on completion rate
              },
            },
          };
        })
      );

      // Sort by total revenue
      summaries.sort((a, b) => b.metrics.totalRevenue - a.metrics.totalRevenue);
      setCoachSummaries(summaries);
    } catch (error) {
      console.error('Error loading coach data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProgressChartData = (improving: number, steady: number, declining: number) => ({
    labels: ['Improving', 'Steady', 'Declining'],
    datasets: [{
      data: [improving, steady, declining],
      backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
      borderWidth: 0,
    }],
  });

  const getPerformanceChartData = (coach: CoachSummary) => ({
    labels: ['Client Retention', 'Response Time', 'Satisfaction', 'Revenue Growth', 'Task Completion'],
    datasets: [{
      label: 'Performance Metrics',
      data: [
        coach.metrics.completionRate,
        Math.max(0, 100 - (coach.metrics.responseTime * 4)), // Convert hours to percentage
        coach.metrics.monthlyTrend.satisfaction,
        coach.metrics.monthlyTrend.revenue,
        coach.metrics.completionRate
      ],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 0.8)',
      borderWidth: 2,
    }],
  });

  const getRevenueChartData = (coach: CoachSummary) => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Monthly Revenue',
      data: Array(6).fill(0).map(() => coach.metrics.totalRevenue * (0.8 + Math.random() * 0.4)),
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {coachSummaries.map((coach) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          key={coach.id}
          className="bg-[#1A1F2B] rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-white">{coach.name}</h3>
              <p className="text-gray-400 text-sm">{coach.email}</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
              View Details →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#2A303C]/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <UserGroupIcon className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-400">Active Clients</span>
              </div>
              <div className="relative h-32">
                <Doughnut
                  data={{
                    labels: ['Active', 'Capacity'],
                    datasets: [{
                      data: [coach.metrics.activeClients, 20 - coach.metrics.activeClients],
                      backgroundColor: ['#3b82f6', '#1e293b'],
                      borderWidth: 0,
                    }],
                  }}
                  options={{
                    cutout: '70%',
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: true },
                    },
                  }}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="text-2xl font-bold text-white">{coach.metrics.activeClients}</div>
                  <div className="text-xs text-gray-400">of 20</div>
                </div>
              </div>
            </div>

            <div className="bg-[#2A303C]/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CurrencyDollarIcon className="h-5 w-5 text-green-400" />
                <span className="text-sm text-gray-400">Revenue Trend</span>
              </div>
              <div className="h-32">
                <Line
                  data={getRevenueChartData(coach)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      x: { display: false },
                      y: { display: false },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-[#2A303C]/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-gray-400">Client Progress</span>
              </div>
              <div className="h-32">
                <Doughnut
                  data={getProgressChartData(
                    coach.metrics.clientProgress.improving,
                    coach.metrics.clientProgress.steady,
                    coach.metrics.clientProgress.declining
                  )}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-[#2A303C]/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-400">Performance</span>
              </div>
              <div className="h-32">
                <Radar
                  data={getPerformanceChartData(coach)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { 
                          color: 'rgba(255, 255, 255, 0.5)',
                          font: { size: 8 }
                        },
                        ticks: { display: false },
                      },
                    },
                    plugins: {
                      legend: { display: false },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#2A303C]/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Client Progress Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-green-400">Improving</span>
                  <span className="text-sm text-white">{coach.metrics.clientProgress.improving}</span>
                </div>
                <motion.div 
                  className="h-2 bg-green-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(coach.metrics.clientProgress.improving / coach.metrics.activeClients) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-yellow-400">Steady</span>
                  <span className="text-sm text-white">{coach.metrics.clientProgress.steady}</span>
                </div>
                <motion.div 
                  className="h-2 bg-yellow-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(coach.metrics.clientProgress.steady / coach.metrics.activeClients) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-red-400">Declining</span>
                  <span className="text-sm text-white">{coach.metrics.clientProgress.declining}</span>
                </div>
                <motion.div 
                  className="h-2 bg-red-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(coach.metrics.clientProgress.declining / coach.metrics.activeClients) * 100}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function Analytics() {
  const [categories] = useState({
    'Company Analytics': [
      {
        id: 1,
        title: 'Financial Overview',
        icon: CurrencyDollarIcon,
        stats: [
          { name: 'Total Revenue', value: '$124,500', change: '+12.5%', type: 'positive' },
          { name: 'MRR', value: '$12,450', change: '+8.2%', type: 'positive' },
          { name: 'ARR', value: '$149,400', change: '+15.3%', type: 'positive' },
          { name: 'Average Revenue Per User', value: '$199', change: '+5.4%', type: 'positive' }
        ]
      },
      {
        id: 2,
        title: 'Platform Usage',
        icon: ChartBarIcon,
        stats: [
          { name: 'Total Active Users', value: '2,450', change: '+18.2%', type: 'positive' },
          { name: 'Daily Active Users', value: '890', change: '+12.1%', type: 'positive' },
          { name: 'Average Session Duration', value: '24m', change: '+3.5%', type: 'positive' },
          { name: 'Feature Adoption Rate', value: '76%', change: '+8.8%', type: 'positive' }
        ]
      },
      {
        id: 3,
        title: 'Growth Metrics',
        icon: ArrowTrendingUpIcon,
        stats: [
          { name: 'User Growth Rate', value: '34%', change: '+5.2%', type: 'positive' },
          { name: 'Conversion Rate', value: '12%', change: '+2.3%', type: 'positive' },
          { name: 'Churn Rate', value: '5.2%', change: '-1.5%', type: 'positive' },
          { name: 'Net Revenue Retention', value: '118%', change: '+3.4%', type: 'positive' }
        ]
      }
    ],
    'Coach Analytics': [
      {
        id: 1,
        title: 'Performance Overview',
        icon: UserGroupIcon,
        stats: [
          { name: 'Total Coaches', value: '4', change: 'New', type: 'positive' },
          { name: 'Average Clients per Coach', value: '4', change: 'Fixed', type: 'positive' },
          { name: 'Client Retention Rate', value: '85%', change: '+5%', type: 'positive' },
          { name: 'Average Response Time', value: '12h', change: '-2h', type: 'positive' }
        ]
      },
      {
        id: 2,
        title: 'Revenue Metrics',
        icon: CurrencyDollarIcon,
        stats: [
          { name: 'Average Revenue per Coach', value: '$796', change: '+12.5%', type: 'positive' },
          { name: 'Top Coach Revenue', value: '$796', change: 'Fixed', type: 'positive' },
          { name: 'Commission Payout', value: '$3,184', change: 'Total', type: 'positive' },
          { name: 'Revenue Growth Rate', value: '24%', change: 'Monthly', type: 'positive' }
        ]
      },
      {
        id: 3,
        title: 'Engagement Metrics',
        icon: CheckCircleIcon,
        stats: [
          { name: 'Session Completion Rate', value: '75%', change: 'Average', type: 'positive' },
          { name: 'Client Satisfaction', value: '4.2/5', change: '+0.2', type: 'positive' },
          { name: 'Resource Usage', value: '82%', change: '+5.3%', type: 'positive' },
          { name: 'Task Completion Rate', value: '78%', change: '+3.4%', type: 'positive' }
        ]
      }
    ],
    'Client Analytics': [
      {
        id: 1,
        title: 'Progress Overview',
        icon: UsersIcon,
        stats: [
          { name: 'Total Active Clients', value: '850', change: '+45', type: 'positive' },
          { name: 'Goal Achievement Rate', value: '78%', change: '+5.2%', type: 'positive' },
          { name: 'Average Progress Score', value: '8.4/10', change: '+0.3', type: 'positive' },
          { name: 'Milestone Completion', value: '82%', change: '+4.5%', type: 'positive' }
        ]
      },
      {
        id: 2,
        title: 'Engagement Metrics',
        icon: ClockIcon,
        stats: [
          { name: 'Session Attendance', value: '92%', change: '+3.5%', type: 'positive' },
          { name: 'Platform Usage Time', value: '45m/day', change: '+8m', type: 'positive' },
          { name: 'Resource Utilization', value: '76%', change: '+5.3%', type: 'positive' },
          { name: 'Response Rate', value: '94%', change: '+2.4%', type: 'positive' }
        ]
      },
      {
        id: 3,
        title: 'Satisfaction Metrics',
        icon: UserIcon,
        stats: [
          { name: 'Overall Satisfaction', value: '4.8/5', change: '+0.2', type: 'positive' },
          { name: 'NPS Score', value: '72', change: '+5', type: 'positive' },
          { name: 'Feature Rating', value: '4.6/5', change: '+0.3', type: 'positive' },
          { name: 'Support Rating', value: '4.9/5', change: '+0.1', type: 'positive' }
        ]
      }
    ]
  });

  const [weeklyAchievements, setWeeklyAchievements] = useState<Achievement[]>([
    {
      clientName: "Emma Thompson",
      coachName: "Michael Chen",
      achievement: "Weight loss goal achieved",
      date: "2 days ago",
      type: "weight",
      metric: "-5kg"
    },
    {
      clientName: "Alexander Kim",
      coachName: "Sarah Johnson",
      achievement: "30-day workout streak",
      date: "3 days ago",
      type: "streak",
      metric: "30 days"
    },
    {
      clientName: "Sofia Patel",
      coachName: "Coach Silvi",
      achievement: "100% weekly completion",
      date: "1 day ago",
      type: "completion",
      metric: "100%"
    },
    {
      clientName: "Lucas Martinez",
      coachName: "Michael Chen",
      achievement: "First milestone reached",
      date: "4 days ago",
      type: "milestone",
      metric: "Level 2"
    }
  ]);

  const [atRiskClients, setAtRiskClients] = useState<AtRiskClient[]>([
    {
      clientName: "James Taylor",
      coachName: "Sarah Johnson",
      riskLevel: "high",
      reason: "Missed last 5 check-ins",
      lastActive: "2 weeks ago",
      trend: "down",
      metric: "0% completion"
    },
    {
      clientName: "Amelia White",
      coachName: "Coach Silvi",
      riskLevel: "medium",
      reason: "Decreasing engagement",
      lastActive: "5 days ago",
      trend: "down",
      metric: "40% completion"
    },
    {
      clientName: "Benjamin Moore",
      coachName: "Michael Chen",
      riskLevel: "low",
      reason: "Plateau in progress",
      lastActive: "3 days ago",
      trend: "up",
      metric: "70% completion"
    }
  ]);

  return (
    <div className="min-h-screen bg-[#13141A] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive analytics across company, coaches, and clients</p>
        </div>

        <div className="w-full">
          <Tab.Group>
            <Tab.List className="flex space-x-2 rounded-xl bg-[#1A1F2B]/50 p-1.5">
              {Object.keys(categories).map((category) => (
                <Tab
                  key={category}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-3 px-4 text-sm font-medium leading-5',
                      'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow'
                        : 'text-gray-400 hover:bg-[#2A303C]/50 hover:text-white'
                    )
                  }
                >
                  {category}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-8">
              {Object.values(categories).map((categoryPanels, idx) => (
                <Tab.Panel
                  key={idx}
                  className={classNames(
                    'rounded-xl bg-[#1A1F2B]/50 p-6',
                    'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                  )}
                >
                  <div className="space-y-8">
                    {categoryPanels.map((section) => (
                      <div key={section.id} className="bg-[#1A1F2B] rounded-xl p-6 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <section.icon className="h-6 w-6 text-blue-500" />
                          </div>
                          <h3 className="text-xl font-semibold text-white">{section.title}</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {section.stats.map((stat, statIdx) => (
                            <div
                              key={statIdx}
                              className="bg-[#2A303C]/50 rounded-lg p-4 hover:bg-[#2A303C] transition-colors duration-200"
                            >
                              <p className="text-sm text-gray-400">{stat.name}</p>
                              <p className="text-2xl font-semibold text-white mt-1">{stat.value}</p>
                              <p className={classNames(
                                'text-sm mt-1',
                                stat.type === 'positive' ? 'text-green-400' : 'text-red-400'
                              )}>
                                {stat.change}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Add Coach Summaries in the Coach Analytics tab */}
                    {idx === 1 && (
                      <div className="mt-8">
                        <h2 className="text-2xl font-bold mb-6">Individual Coach Performance</h2>
                        <CoachSummaries />
                      </div>
                    )}
                  </div>
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>

        {/* Top Achievements Section */}
        <div className="bg-[#1a1b1e] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <TrophyIcon className="h-6 w-6 text-yellow-500 mr-2" />
            Top Achievements This Week
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {weeklyAchievements.map((achievement, index) => (
              <div key={index} className="bg-[#13141A] rounded-lg p-4 border border-gray-800">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center mr-3">
                      {achievement.type === 'weight' && <ArrowTrendingDownIcon className="h-4 w-4 text-green-500" />}
                      {achievement.type === 'streak' && <ClockIcon className="h-4 w-4 text-blue-500" />}
                      {achievement.type === 'completion' && <ArrowTrendingUpIcon className="h-4 w-4 text-purple-500" />}
                      {achievement.type === 'milestone' && <TrophyIcon className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{achievement.clientName}</p>
                      <p className="text-xs text-gray-500">{achievement.coachName}</p>
                    </div>
                  </div>
                  {achievement.metric && (
                    <span className="text-sm font-semibold text-green-500">{achievement.metric}</span>
                  )}
                </div>
                <p className="text-sm text-gray-300">{achievement.achievement}</p>
                <p className="text-xs text-gray-500 mt-2">{achievement.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* At Risk Clients Section */}
        <div className="bg-[#1a1b1e] rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
            Clients Requiring Attention
          </h2>
          <div className="space-y-4">
            {atRiskClients.map((client, index) => (
              <div key={index} className="bg-[#13141A] rounded-lg p-4 border border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`
                      h-10 w-10 rounded-full flex items-center justify-center mr-4
                      ${client.riskLevel === 'high' ? 'bg-red-500/10' : 
                        client.riskLevel === 'medium' ? 'bg-yellow-500/10' : 
                        'bg-blue-500/10'}
                    `}>
                      <HeartIcon className={`
                        h-5 w-5
                        ${client.riskLevel === 'high' ? 'text-red-500' : 
                          client.riskLevel === 'medium' ? 'text-yellow-500' : 
                          'text-blue-500'}
                      `} />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium">{client.clientName}</h3>
                        <span className={`
                          ml-3 px-2 py-1 rounded-full text-xs
                          ${client.riskLevel === 'high' ? 'bg-red-500/10 text-red-500' : 
                            client.riskLevel === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 
                            'bg-blue-500/10 text-blue-500'}
                        `}>
                          {client.riskLevel.toUpperCase()} RISK
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Coach: {client.coachName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      {client.trend === 'down' ? (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                      ) : (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      <span className="text-sm font-medium">{client.metric}</span>
                    </div>
                    <p className="text-xs text-gray-500">Last active: {client.lastActive}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center">
                  <ExclamationTriangleIcon className={`
                    h-4 w-4 mr-2
                    ${client.riskLevel === 'high' ? 'text-red-500' : 
                      client.riskLevel === 'medium' ? 'text-yellow-500' : 
                      'text-blue-500'}
                  `} />
                  <p className="text-sm text-gray-400">{client.reason}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    Take Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 