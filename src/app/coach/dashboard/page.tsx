'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import {
  BellIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  FireIcon,
  SparklesIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  ChevronRightIcon,
  PhotoIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  BoltIcon,
  HeartIcon,
  TrophyIcon,
  FaceSmileIcon,
  ChevronDownIcon,
  PencilIcon,
  ArrowPathIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';
import { 
  CheckInForm, 
  CheckInMetrics, 
  CheckInStatus, 
  CheckInPhoto,
  CoachDashboardMetrics, 
  EnhancedCheckInForm as IEnhancedCheckInForm
} from '@/types/checkIn';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DashboardCustomizer } from '@/components/DashboardCustomizer';
import { CoachNavigation } from '@/components/navigation/CoachNavigation';
import { PriorityAlerts } from '@/components/dashboard/PriorityAlerts'
import { AnalyticsSnapshot } from '@/components/dashboard/AnalyticsSnapshot'
import { ClientOfTheWeek } from '@/components/dashboard/ClientOfTheWeek';
import { RecentProgressPhotos } from '@/components/dashboard/RecentProgressPhotos';
import { AIGroupInsights } from '@/components/dashboard/AIGroupInsights';
import { CommandPalette } from '@/components/CommandPalette';
import { DashboardSidebar } from '@/components/navigation/DashboardSidebar';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { NotificationCenter } from '@/components/dashboard/NotificationCenter';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import { CoachSummary } from '@/components/dashboard/CoachSummary';
import { RecentBadgeWins } from '@/components/dashboard/RecentBadgeWins';

interface ClientProgress {
  id: string;
  name: string;
  avatar?: string;
  lastCheckIn: string;
  checkInStreak: number;
  weeklyProgress: {
    training: number;
    nutrition: number;
    mindset: number;
  };
  recentAchievements: string[];
  focusAreas: string[];
  status: 'on_track' | 'needs_attention' | 'at_risk';
}

interface DashboardMetrics {
  totalClients: number;
  activeToday: number;
  pendingCheckIns: number;
  completedCheckIns: number;
  clientProgress: {
    improving: number;
    steady: number;
    needsAttention: number;
  };
  weeklyEngagement: number;
}

interface ProgressPhoto {
  id: string;
  clientId: string;
  clientName: string;
  photoUrl: string;
  date: string;
  type: 'before' | 'after' | 'progress';
}

interface SentimentMetric {
  category: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface GroupInsight {
  type: 'success' | 'warning' | 'info';
  message: string;
  impact: 'high' | 'medium' | 'low';
}

interface AIAnalysis {
  overallMood: SentimentMetric[];
  recentWins: string[];
  commonChallenges: string[];
  insights: GroupInsight[];
  focusAreas: string[];
}

interface ClientOfTheWeek {
  id: string;
  name: string;
  avatar?: string;
  achievement: string;
  weekNumber: number;
  stats: {
    workouts: { completed: number; total: number; trend: 'up' | 'down' | 'stable'; change: number };
    nutrition: { percentage: number; trend: 'up' | 'down' | 'stable'; change: number };
    steps: { average: number; trend: 'up' | 'down' | 'stable'; change: number };
  };
}

interface HonorableMention {
  id: string;
  name: string;
  avatar?: string;
  achievement: string;
  highlight: string;
  metric: {
    label: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    change: number;
  };
}

interface CoachProfile {
  name: string;
  motivationalQuote: string;
  lastQuoteUpdate?: string;
}

interface ClientAIInsights {
  summary: string;
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  trends: {
    metric: string;
    status: 'improving' | 'declining' | 'stable';
    insight: string;
  }[];
}

interface SectionPreference {
  isVisible: boolean;
  order: number;
  columnSpan: 1 | 2 | 3;
}

interface WidgetLayout {
  [key: string]: {
    order: number;
    isExpanded: boolean;
  };
}

// Mock data - replace with real data from your backend
const mockMetrics: DashboardMetrics = {
  totalClients: 25,
  activeToday: 8,
  pendingCheckIns: 5,
  completedCheckIns: 15,
  clientProgress: {
    improving: 12,
    steady: 8,
    needsAttention: 5,
  },
  weeklyEngagement: 85,
};

const mockEnhancedCheckIn: IEnhancedCheckInForm = {
  id: '1',
  templateId: '1',
  clientId: '1',
  title: 'Weekly Check-in',
  description: 'Standard weekly check-in form',
  questions: [],
  answers: [],
  metrics: {
    training: 8,
    nutrition: 7,
    mindset: 9
  },
  status: {
    state: 'completed',
    clientProgress: 'on_track',
    lastUpdated: new Date().toISOString()
  },
  dueDate: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  streak: {
    current: 5,
    longest: 10,
    lastCheckIn: new Date().toISOString(),
    consistency: 0.8
  },
  history: {
    lastFiveCheckIns: [],
    trends: []
  },
  coachInteraction: {
    lastReview: new Date().toISOString(),
    averageResponseTime: 24,
    totalReviews: 10
  },
  engagement: {
    photoSubmissions: 5,
    commentResponses: 8,
    actionItemsCompleted: 12,
    totalActionItems: 15
  }
};

const mockDashboardMetrics: CoachDashboardMetrics = {
  dailyMetrics: {
    totalCheckIns: 15,
    pendingReviews: 5,
    completedReviews: 15,
    averageResponseTime: 90
  },
  clientMetrics: {
    totalActive: 25,
    atRisk: 5,
    improving: 12,
    needsAttention: 5
  },
  engagementMetrics: {
    weeklyActiveClients: 21,
    averageCheckInCompletion: 88,
    photoSubmissionRate: 75,
    feedbackResponseRate: 92
  },
  priorityActions: {
    urgentReviews: ['check-1', 'check-2'],
    atRiskClients: ['client-1', 'client-2'],
    pendingPhotos: ['check-3', 'check-4'],
    missedCheckIns: ['client-3', 'client-4']
  }
};

const mockClientProgress: IEnhancedCheckInForm[] = [mockEnhancedCheckIn];

const mockProgressPhotos: ProgressPhoto[] = [
  {
    id: 'p1',
    clientId: 'client-1',
    clientName: 'Sarah Wilson',
    photoUrl: '/progress-photos/sarah-progress-1.jpg',
    date: '2024-03-21',
    type: 'progress'
  },
  // ... other photos
];

const mockAIAnalysis: AIAnalysis = {
  overallMood: [
    { category: 'Energy', score: 7.8, trend: 'up', change: 0.5 },
    { category: 'Motivation', score: 8.2, trend: 'up', change: 0.3 },
    { category: 'Stress', score: 4.5, trend: 'down', change: -0.8 },
    { category: 'Sleep Quality', score: 7.2, trend: 'stable', change: 0.1 },
  ],
  recentWins: [
    "80% of clients hit their protein targets this week",
    "Average step count increased by 2,000 steps",
    "5 clients achieved personal records in strength training",
    "Significant improvement in morning routine compliance"
  ],
  commonChallenges: [
    "Weekend nutrition adherence dropping",
    "Post-work workout attendance decreased",
    "Stress management during work hours",
    "Late-night snacking incidents increased"
  ],
  insights: [
    {
      type: 'success',
      message: 'Group cohesion is strengthening, with 60% more peer interactions this week',
      impact: 'high'
    },
    {
      type: 'warning',
      message: 'Sleep patterns show disruption in 30% of clients - may need sleep hygiene workshop',
      impact: 'medium'
    },
    {
      type: 'info',
      message: 'Nutrition compliance peaks on Mondays and gradually decreases through the week',
      impact: 'high'
    }
  ],
  focusAreas: [
    "Schedule a group session on weekend meal prep",
    "Implement stress management techniques",
    "Review and adjust evening routines",
    "Strengthen accountability partnerships"
  ]
};

const mockClientOfTheWeek: ClientOfTheWeek = {
  id: '1',
  name: 'Sarah Wilson',
  achievement: 'Most Consistent Progress',
  weekNumber: 12,
  stats: {
    workouts: { completed: 6, total: 6, trend: 'up', change: 1 },
    nutrition: { percentage: 95, trend: 'up', change: 5 },
    steps: { average: 12000, trend: 'up', change: 2000 }
  }
};

const mockHonorableMentions: HonorableMention[] = [
  {
    id: '3',
    name: 'Emma Davis',
    achievement: 'Biggest Breakthrough',
    highlight: 'Overcame fear of heavy lifting',
    metric: {
      label: 'Strength PR',
      value: '80kg',
      trend: 'up',
      change: 15
    }
  },
  {
    id: '4',
    name: 'James Wilson',
    achievement: 'Most Resilient',
    highlight: 'Maintained routine during travel',
    metric: {
      label: 'Consistency',
      value: '92%',
      trend: 'up',
      change: 12
    }
  }
];

const mockCoachProfile: CoachProfile = {
  name: "Michael Chen",
  motivationalQuote: "Empowering others to become their strongest, healthiest selves. Every small step counts!",
  lastQuoteUpdate: "2024-04-05"
};

const mockClientAIInsights: ClientAIInsights = {
  summary: "Based on Sarah's recent check-ins and progress data, she's showing consistent improvement in most areas, particularly in energy levels and sleep quality. Her commitment to the program is evident in her regular check-ins and goal progression.",
  strengths: [
    "Achieved a steady weight loss trend, down 4kg over the past 3 months",
    "Significant improvement in energy levels, up from 60% to 85%",
    "Sleep quality has improved by 1.3 hours on average"
  ],
  challenges: [
    "Muscle tone progress is slightly behind schedule at 45%",
    "Weekend workout consistency could be improved"
  ],
  recommendations: [
    "Consider adjusting the strength training program to accelerate muscle tone development",
    "Schedule check-ins earlier in the day when energy levels are highest",
    "Maintain the current sleep hygiene practices as they're showing positive results"
  ],
  trends: [
    {
      metric: "Energy",
      status: "improving",
      insight: "Consistent upward trend in morning energy levels"
    },
    {
      metric: "Sleep",
      status: "improving",
      insight: "Quality of sleep has improved significantly"
    },
    {
      metric: "Nutrition",
      status: "stable",
      insight: "Maintaining good adherence to meal plan"
    }
  ]
};

const getStatusColor = (status: CheckInStatus['clientProgress']) => {
  switch (status) {
    case 'on_track':
      return 'text-green-500 bg-green-50 dark:bg-green-500/10';
    case 'needs_attention':
      return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10';
    case 'at_risk':
      return 'text-red-500 bg-red-50 dark:bg-red-500/10';
  }
};

const getStatusIcon = (status: CheckInStatus['clientProgress']) => {
  switch (status) {
    case 'on_track':
      return <CheckCircleIcon className="w-5 h-5" />;
    case 'needs_attention':
      return <ExclamationCircleIcon className="w-5 h-5" />;
    case 'at_risk':
      return <BellIcon className="w-5 h-5" />;
  }
};

const getAverageProgress = (metrics: CheckInMetrics) => {
  const values = Object.values(metrics).filter(val => typeof val === 'number') as number[];
  return Math.round(values.reduce((acc, val) => acc + val, 0) / values.length);
};

// Add a helper function for consistent date formatting
const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy');
  } catch (error) {
    return dateString;
  }
};

async function fetchAIInsights(checkIns: CheckInForm[], retryCount = 0): Promise<AIAnalysis> {
  try {
    // Only send the latest check-in
    const latestCheckIn = checkIns[0];
    
    const response = await fetch('/api/coach/ai-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkIns: [latestCheckIn],
        analysisType: 'group'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI insights error:', errorData);
      
      if (response.status === 429 && retryCount < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchAIInsights([latestCheckIn], retryCount + 1);
      }
      
      if (response.status === 401 || response.status === 403) {
        toast.error('API authentication failed. Please check your API key.');
      } else if (response.status === 500) {
        toast.error('Server error occurred. Using cached data.');
      } else {
        toast.error('Unable to fetch AI insights. Using cached data.');
      }
      
      return mockAIAnalysis;
    }

    const data = await response.json();
    return data.insights || mockAIAnalysis;
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    if (retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return fetchAIInsights(checkIns, retryCount + 1);
    }
    toast.error('Unable to fetch AI insights. Using cached data.');
    return mockAIAnalysis;
  }
}

export default function DashboardPage() {
  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [widgetLayout, setWidgetLayout] = useState<WidgetLayout>({
    coachSummary: { order: 1, isExpanded: true },
    analytics: { order: 2, isExpanded: true },
    alerts: { order: 3, isExpanded: true },
    clientProgress: { order: 4, isExpanded: true },
    insights: { order: 5, isExpanded: true }
  });

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !result.source) return;
    
    const items = { ...widgetLayout };
    const [reorderedItem] = Object.entries(items).filter(
      ([_, value]) => value.order === result.source.index + 1
    );
    const [targetItem] = Object.entries(items).filter(
      ([_, value]) => value.order === result.destination.index + 1
    );
    
    if (reorderedItem && targetItem) {
      items[reorderedItem[0]].order = result.destination.index + 1;
      items[targetItem[0]].order = result.source.index + 1;
    }
    
    setWidgetLayout(items);
  };

  const handleRefreshInsights = async () => {
    setIsRefreshingInsights(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshingInsights(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Command Palette */}
      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />

      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar 
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-200 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
          {/* Top Navigation Bar */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                {/* Breadcrumb */}
                <div className="flex items-center">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
                </div>

                {/* Quick Actions */}
                <QuickActions 
                  onSearchOpen={() => setShowCommandPalette(true)}
                  onNotificationsOpen={() => setShowNotifications(true)}
                />
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="container mx-auto px-4 py-8 space-y-6">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="dashboard-widgets">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-6"
                  >
                    {Object.entries(widgetLayout)
                      .sort(([_, a], [__, b]) => a.order - b.order)
                      .map(([key, value], index) => (
                        <Draggable key={key} draggableId={key} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                {/* Widget Header */}
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between"
                                  {...provided.dragHandleProps}
                                >
                                  <h2 className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </h2>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => {
                                        setWidgetLayout({
                                          ...widgetLayout,
                                          [key]: {
                                            ...value,
                                            isExpanded: !value.isExpanded
                                          }
                                        });
                                      }}
                                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                    >
                                      <ArrowsPointingOutIcon className="h-5 w-5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Widget Content */}
                                <div className={`transition-all duration-200 ${value.isExpanded ? 'block' : 'hidden'}`}>
                                  {key === 'coachSummary' && (
                                    <div className="p-6 space-y-6">
                                      {/* Top Quote Section */}
                                      <div className="bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-lg p-6 border border-blue-200/10">
                                        <div className="flex items-start gap-4">
                                          <SparklesIcon className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" />
                                          <div>
                                            <h2 className="text-lg font-semibold text-white mb-3">Coach Impact Summary</h2>
                                            <p className="text-gray-300 italic text-sm leading-relaxed">
                                              "Your dedication to your clients' success is making a real difference. Keep fostering those transformative moments and celebrating the small wins - they're the building blocks of lasting change."
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Metrics Grid */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left Column - This Week's Wins */}
                                        <div className="bg-gray-800/50 rounded-lg p-6">
                                          <div className="flex items-center gap-3 mb-4">
                                            <TrophyIcon className="h-6 w-6 text-yellow-500" />
                                            <h3 className="text-lg font-semibold text-white">This Week's Wins</h3>
                                          </div>
                                          <div className="space-y-4">
                                            <div className="flex items-center gap-4 bg-gray-700/30 rounded-lg p-4">
                                              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                <ChartBarIcon className="h-6 w-6 text-emerald-500" />
                                              </div>
                                              <div>
                                                <div className="text-2xl font-bold text-white">12</div>
                                                <div className="text-sm text-gray-400">New Personal Records</div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-4 bg-gray-700/30 rounded-lg p-4">
                                              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <CheckCircleIcon className="h-6 w-6 text-blue-500" />
                                              </div>
                                              <div>
                                                <div className="text-2xl font-bold text-white">85%</div>
                                                <div className="text-sm text-gray-400">Check-in Completion</div>
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-4 bg-gray-700/30 rounded-lg p-4">
                                              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                <ArrowTrendingUpIcon className="h-6 w-6 text-purple-500" />
                                              </div>
                                              <div>
                                                <div className="text-2xl font-bold text-white">3</div>
                                                <div className="text-sm text-gray-400">Plateaus Overcome</div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Right Column - Client Appreciation */}
                                        <div className="bg-gray-800/50 rounded-lg p-6">
                                          <div className="flex items-center gap-3 mb-4">
                                            <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-blue-500" />
                                            <h3 className="text-lg font-semibold text-white">Client Appreciation</h3>
                                          </div>
                                          <div className="space-y-4">
                                            <div className="bg-gray-700/30 rounded-lg p-4">
                                              <div className="flex items-start gap-3 mb-2">
                                                <div className="h-8 w-8 rounded-full bg-gray-600 flex-shrink-0" />
                                                <div>
                                                  <div className="text-sm font-medium text-white">Sarah W.</div>
                                                  <p className="text-sm text-gray-400 italic">
                                                    "Your guidance has been transformative. I never thought I could achieve this much!"
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="bg-gray-700/30 rounded-lg p-4">
                                              <div className="flex items-start gap-3 mb-2">
                                                <div className="h-8 w-8 rounded-full bg-gray-600 flex-shrink-0" />
                                                <div>
                                                  <div className="text-sm font-medium text-white">James T.</div>
                                                  <p className="text-sm text-gray-400 italic">
                                                    "The way you break down complex nutrition concepts makes it so much easier to follow through."
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Bottom Impact Metrics */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-gray-800/50 rounded-lg p-6">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="text-sm text-gray-400">Client Satisfaction</div>
                                            <div className="text-sm text-emerald-500">↑5%</div>
                                          </div>
                                          <div className="flex items-baseline gap-2">
                                            <div className="text-3xl font-bold text-white">94%</div>
                                            <div className="text-sm text-gray-400">overall rating</div>
                                          </div>
                                          <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
                                          </div>
                                        </div>

                                        <div className="bg-gray-800/50 rounded-lg p-6">
                                          <div className="flex items-center justify-between mb-2">
                                            <div className="text-sm text-gray-400">Goal Achievement Rate</div>
                                            <div className="text-sm text-emerald-500">↑3%</div>
                                          </div>
                                          <div className="flex items-baseline gap-2">
                                            <div className="text-3xl font-bold text-white">88%</div>
                                            <div className="text-sm text-gray-400">success rate</div>
                                          </div>
                                          <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '88%' }} />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {key === 'analytics' && (
                                    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 p-6">
                                      {/* Since Last Login Summary */}
                                      <div className="xl:col-span-4 mb-6">
                                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                                          <div className="p-6">
                                            <div className="flex items-center justify-between mb-6">
                                              <div className="flex items-center gap-3">
                                                <ClockIcon className="h-6 w-6 text-blue-500" />
                                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                  Since Last Login
                                                </h2>
                                              </div>
                                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                                Last login: {format(new Date().setHours(new Date().getHours() - 24), 'MMM d, h:mm a')}
                                              </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                              {/* Check-ins */}
                                              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                                <div className="flex items-center gap-4">
                                                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                    <CheckCircleIcon className="h-6 w-6 text-blue-500" />
                                                  </div>
                                                  <div>
                                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">8</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">New Check-ins</div>
                                                    <Link href="/coach/check-ins" className="text-xs text-blue-500 hover:text-blue-600 mt-1 inline-block">
                                                      View all →
                                                    </Link>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Progress Photos */}
                                              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                                <div className="flex items-center gap-4">
                                                  <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                                                    <PhotoIcon className="h-6 w-6 text-purple-500" />
                                                  </div>
                                                  <div>
                                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">3</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">New Progress Photos</div>
                                                    <Link href="/coach/progress-photos" className="text-xs text-blue-500 hover:text-blue-600 mt-1 inline-block">
                                                      View all →
                                                    </Link>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Measurements */}
                                              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                                <div className="flex items-center gap-4">
                                                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                    <ChartBarIcon className="h-6 w-6 text-emerald-500" />
                                                  </div>
                                                  <div>
                                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">5</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">New Measurements</div>
                                                    <Link href="/coach/measurements" className="text-xs text-blue-500 hover:text-blue-600 mt-1 inline-block">
                                                      View all →
                                                    </Link>
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Achievements */}
                                              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                                                <div className="flex items-center gap-4">
                                                  <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                                    <TrophyIcon className="h-6 w-6 text-yellow-500" />
                                                  </div>
                                                  <div>
                                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">4</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">New Achievements</div>
                                                    <Link href="/coach/achievements" className="text-xs text-blue-500 hover:text-blue-600 mt-1 inline-block">
                                                      View all →
                                                    </Link>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Recent Activity Timeline */}
                                            <div className="mt-8">
                                              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Recent Activity Timeline</h3>
                                              <div className="space-y-4">
                                                {[
                                                  {
                                                    time: '2 hours ago',
                                                    client: 'Sarah Wilson',
                                                    action: 'submitted a check-in',
                                                    type: 'check-in',
                                                    highlight: 'Completed all workouts this week'
                                                  },
                                                  {
                                                    time: '4 hours ago',
                                                    client: 'James Thompson',
                                                    action: 'uploaded new progress photos',
                                                    type: 'photos',
                                                    highlight: '+3 photos added'
                                                  },
                                                  {
                                                    time: '5 hours ago',
                                                    client: 'Emma Davis',
                                                    action: 'updated measurements',
                                                    type: 'measurements',
                                                    highlight: '-2.5 inches on waist'
                                                  },
                                                  {
                                                    time: '6 hours ago',
                                                    client: 'Michael Chen',
                                                    action: 'earned a new badge',
                                                    type: 'achievement',
                                                    highlight: '"Consistency Champion" for 30-day streak'
                                                  }
                                                ].map((activity, index) => (
                                                  <div key={index} className="flex items-start gap-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg p-3">
                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                                      activity.type === 'check-in' ? 'bg-blue-500/20' :
                                                      activity.type === 'photos' ? 'bg-purple-500/20' :
                                                      activity.type === 'measurements' ? 'bg-emerald-500/20' :
                                                      'bg-yellow-500/20'
                                                    }`}>
                                                      {activity.type === 'check-in' && <CheckCircleIcon className="h-4 w-4 text-blue-500" />}
                                                      {activity.type === 'photos' && <PhotoIcon className="h-4 w-4 text-purple-500" />}
                                                      {activity.type === 'measurements' && <ChartBarIcon className="h-4 w-4 text-emerald-500" />}
                                                      {activity.type === 'achievement' && <TrophyIcon className="h-4 w-4 text-yellow-500" />}
                                                    </div>
                                                    <div className="flex-1">
                                                      <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                          {activity.client} {activity.action}
                                                        </p>
                                                        <span className="text-xs text-gray-500">{activity.time}</span>
                                                      </div>
                                                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {activity.highlight}
                                                      </p>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="xl:col-span-3">
                                        <AnalyticsSnapshot />
                                      </div>
                                      <div className="xl:col-span-1">
                                        <PriorityAlerts />
                                      </div>
                                    </div>
                                  )}
                                  {key === 'clientProgress' && (
                                    <div className="p-6">
                                      {/* Top Row - Client of the Week */}
                                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
                                        <div className="xl:col-span-1">
                                          <ClientOfTheWeek client={mockClientOfTheWeek} />
                                        </div>
                                        <div className="xl:col-span-2">
                                          {/* Client Stats Summary */}
                                          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white h-full">
                                            <div className="flex items-center justify-between mb-4">
                                              <h3 className="text-lg font-semibold">Weekly Progress Overview</h3>
                                              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Week 12</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                              <div>
                                                <div className="text-white/70 text-sm mb-1">Workouts Completed</div>
                                                <div className="text-2xl font-bold">92%</div>
                                                <div className="text-sm text-emerald-300">↑ 5% from last week</div>
                                              </div>
                                              <div>
                                                <div className="text-white/70 text-sm mb-1">Nutrition Goals</div>
                                                <div className="text-2xl font-bold">85%</div>
                                                <div className="text-sm text-emerald-300">↑ 3% from last week</div>
                                              </div>
                                              <div>
                                                <div className="text-white/70 text-sm mb-1">Active Clients</div>
                                                <div className="text-2xl font-bold">23/25</div>
                                                <div className="text-sm text-emerald-300">2 new check-ins today</div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Middle Row - Badge Wins and Progress Photos */}
                                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                                        <div>
                                          <RecentBadgeWins />
                                        </div>
                                        <div>
                                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                                            <div className="p-6">
                                              <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                  <PhotoIcon className="h-6 w-6 text-blue-500" />
                                                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    Latest Transformations
                                                  </h2>
                                                </div>
                                                <Link
                                                  href="/coach/progress-photos"
                                                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
                                                >
                                                  View All →
                                                </Link>
                                              </div>
                                              <div className="grid grid-cols-2 gap-4">
                                                {mockProgressPhotos.slice(0, 2).map((photo) => (
                                                  <div key={photo.id} className="relative group">
                                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                      <Image
                                                        src={photo.photoUrl}
                                                        alt={`Progress photo from ${photo.clientName}`}
                                                        fill
                                                        className="object-cover transition-transform group-hover:scale-105"
                                                      />
                                                    </div>
                                                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white">
                                                      <p className="text-sm font-medium">{photo.clientName}</p>
                                                      <p className="text-xs opacity-80">{format(new Date(photo.date), 'MMM d, yyyy')}</p>
                                                    </div>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Bottom Row - Client Milestones */}
                                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                                        <div className="p-6">
                                          <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                              <TrophyIcon className="h-6 w-6 text-yellow-500" />
                                              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Recent Milestones
                                              </h2>
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {mockHonorableMentions.map((mention) => (
                                              <div
                                                key={mention.id}
                                                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4"
                                              >
                                                <div className="flex items-start gap-3">
                                                  <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0" />
                                                  <div>
                                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                      {mention.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                      {mention.highlight}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {mention.metric.value}
                                                      </span>
                                                      <span className={`text-xs ${
                                                        mention.metric.trend === 'up' 
                                                          ? 'text-green-500' 
                                                          : mention.metric.trend === 'down' 
                                                          ? 'text-red-500' 
                                                          : 'text-gray-500'
                                                      }`}>
                                                        {mention.metric.trend === 'up' ? '↑' : '↓'} {mention.metric.change}%
                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {key === 'insights' && (
                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-6">
                                      <div className="xl:col-span-1">
                                        <AIGroupInsights
                                          lastUpdated="2024-04-08"
                                          onRefresh={handleRefreshInsights}
                                          isLoading={isRefreshingInsights}
                                        />
                                      </div>
                                      <div className="xl:col-span-1">
                                        {/* Additional insights components */}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </div>
    </div>
  );
} 