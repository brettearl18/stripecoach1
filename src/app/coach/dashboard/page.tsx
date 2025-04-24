'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Trophy as LucideTrophy, Target, Heart as LucideHeart, Camera, LineChart } from "lucide-react";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
  TagIcon,
  ClipboardDocumentCheckIcon,
  PhotoIcon,
  ChevronRightIcon,
  BellIcon,
  UserGroupIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  PencilIcon,
  HeartIcon,
  TrophyIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  CameraIcon
} from '@heroicons/react/24/outline';
import { Avatar } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { DashboardCustomizer } from '@/components/DashboardCustomizer';
import { CoachNavigation } from '@/components/navigation/CoachNavigation';
import { PriorityAlerts } from '@/components/dashboard/PriorityAlerts';
import { AnalyticsSnapshot } from '@/components/dashboard/AnalyticsSnapshot';
import { ClientOfTheWeek } from '@/components/dashboard/ClientOfTheWeek';
import { RecentProgressPhotos } from '@/components/dashboard/RecentProgressPhotos';
import { AIGroupInsights } from '@/components/dashboard/AIGroupInsights';
import { CommandPalette } from '@/components/CommandPalette';
import { DashboardSidebar } from '@/components/navigation/DashboardSidebar';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { NotificationCenter } from '@/components/dashboard/NotificationCenter';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult } from 'react-beautiful-dnd';
import { CoachSummary, type CoachSummaryProps } from '@/components/dashboard/CoachSummary';
import { RecentBadgeWins } from '@/components/dashboard/RecentBadgeWins';
import { 
  CheckInForm, 
  CheckInMetrics, 
  CheckInStatus, 
  CheckInPhoto,
  CoachDashboardMetrics, 
  EnhancedCheckInForm as IEnhancedCheckInForm
} from '@/types/checkIn';

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
  clientMetrics: {
    improving: number;
    totalActive: number;
  };
  engagementMetrics: {
    averageCheckInCompletion: number;
  };
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
  clientMetrics: {
    improving: 12,
    totalActive: 25
  },
  engagementMetrics: {
    averageCheckInCompletion: 88
  }
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
    id: '1',
    clientId: 'client1',
    clientName: 'John Doe',
    photoUrl: '/mock/progress1.jpg',
    date: '2024-03-15',
    type: 'progress'
  },
  {
    id: '2',
    clientId: 'client2',
    clientName: 'Jane Smith',
    photoUrl: '/mock/progress2.jpg',
    date: '2024-03-14',
    type: 'progress'
  }
];

const mockAIAnalysis: AIAnalysis = {
  overallMood: [
    { category: 'Energy', score: 7.8, trend: 'up', change: 0.5 },
    { category: 'Motivation', score: 8.2, trend: 'up', change: 0.3 }
  ],
  recentWins: [
    "80% of clients hit their protein targets this week",
    "Average step count increased by 2,000 steps"
  ],
  commonChallenges: [
    "Weekend nutrition adherence dropping",
    "Post-work workout attendance decreased"
  ],
  insights: [
    {
      type: 'success',
      message: 'Group motivation levels have increased by 25% this week',
      impact: 'high'
    },
    {
      type: 'info',
      message: 'Most clients are hitting their step goals consistently',
      impact: 'medium'
    }
  ],
  focusAreas: [
    "Schedule a group session on weekend meal prep",
    "Implement stress management techniques"
  ]
};

const mockClientOfTheWeek = {
  name: "Sarah Johnson",
  achievement: "Crushed all workout goals and improved nutrition compliance by 40%",
  weekNumber: 12,
  stats: {
    workouts: { completed: 5, total: 5, change: 2 },
    nutrition: { percentage: 95, change: 15 },
    steps: { average: 12000, change: 2000 }
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
  name: "Sarah Johnson",
  motivationalQuote: "Empowering others to become their strongest, healthiest selves. Every small step counts!",
  lastQuoteUpdate: new Date().toISOString()
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

async function fetchAIInsights(checkIns: CheckInForm[], retryCount = 0): Promise<GroupInsight[]> {
  try {
    const response = await fetch('/api/coach/ai/insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ checkIns }),
    });

    if (!response.ok) {
      if (retryCount < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return fetchAIInsights(checkIns, retryCount + 1);
      }
      return mockAIAnalysis.insights;
    }

    const data = await response.json();
    return data.insights || mockAIAnalysis.insights;
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    if (retryCount < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return fetchAIInsights(checkIns, retryCount + 1);
    }
    toast.error('Unable to fetch AI insights. Using cached data.');
    return mockAIAnalysis.insights;
  }
}

export default function CoachDashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockMetrics);
  const [clientProgress, setClientProgress] = useState(mockClientProgress);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis>(mockAIAnalysis);
  const [coachProfile, setCoachProfile] = useState<CoachProfile>(mockCoachProfile);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const lastAIUpdate = new Date().toISOString();

  const handleSearchOpen = () => {
    setCommandPaletteOpen(true);
  };

  const handleNotificationsOpen = () => {
    setNotificationsOpen(true);
  };

  const handleNotificationsClose = () => {
    setNotificationsOpen(false);
  };

  const handleCommandPaletteClose = () => {
    setCommandPaletteOpen(false);
  };

  const handleAIInsightsRefresh = async () => {
    setIsLoadingInsights(true);
    // TODO: Implement refresh logic
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setIsLoadingInsights(false);
    toast.success('Insights refreshed');
  };

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      try {
        // In a real app, you would fetch data here
        await new Promise(resolve => setTimeout(resolve, 1000));
        setMetrics(mockMetrics);
        setCoachProfile(mockCoachProfile);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (isLoading) {
          return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </div>
          );
  }

  // Transform metrics into CoachSummary format
  const coachSummaryData: CoachSummaryProps = {
    coachName: coachProfile.name,
    weeklyHighlights: {
      wins: [
        `${metrics.clientMetrics.improving} clients improving`,
        `${metrics.engagementMetrics.averageCheckInCompletion}% check-in completion`,
        `${metrics.clientMetrics.totalActive} active clients`
      ],
      clientQuotes: [
        {
          quote: "Your guidance has been transformative. I never thought I could achieve this much!",
          clientName: "Sarah W."
        },
        {
          quote: "The way you break down complex nutrition concepts makes it so much easier to follow through.",
          clientName: "James T."
        }
      ],
      impactMetrics: [
        {
          label: "Client Satisfaction",
          value: "94%",
          trend: "up",
          change: 5
        },
        {
          label: "Goal Achievement Rate",
          value: `${metrics.engagementMetrics.averageCheckInCompletion}%`,
          trend: "up",
          change: 3
        }
      ]
    },
    encouragement: coachProfile.motivationalQuote
  };

  // Transform client of the week data to match interface
  const transformedClientOfWeek = {
    name: mockClientOfTheWeek.name,
    achievement: mockClientOfTheWeek.achievement,
    weekNumber: mockClientOfTheWeek.weekNumber,
    stats: {
      workouts: {
        completed: mockClientOfTheWeek.stats.workouts.completed,
        total: mockClientOfTheWeek.stats.workouts.total,
        change: mockClientOfTheWeek.stats.workouts.change
      },
      nutrition: {
        percentage: mockClientOfTheWeek.stats.nutrition.percentage,
        change: mockClientOfTheWeek.stats.nutrition.change
      },
      steps: {
        average: mockClientOfTheWeek.stats.steps.average,
        change: mockClientOfTheWeek.stats.steps.change
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Coach Dashboard</h1>
                <div className="flex items-center space-x-4">
            <button
              onClick={handleSearchOpen}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">Search</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
            <button
              onClick={handleNotificationsOpen}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Analytics Snapshot */}
          <div className="lg:col-span-2">
            <AnalyticsSnapshot />
            </div>

          {/* Client of the Week */}
          <div className="lg:col-span-1">
            <ClientOfTheWeek client={mockClientOfTheWeek} />
                </div>

          {/* Priority Alerts */}
          <div className="lg:col-span-2">
            <PriorityAlerts />
        </div>

          {/* Recent Badge Wins */}
          <div className="lg:col-span-1">
            <RecentBadgeWins />
            </div>

          {/* AI Group Insights */}
          <div className="lg:col-span-3">
            <AIGroupInsights 
              lastUpdated={lastAIUpdate}
              onRefresh={handleAIInsightsRefresh}
              isLoading={isLoadingInsights}
            />
        </div>

        {/* Recent Progress Photos */}
          <div className="lg:col-span-3">
            <RecentProgressPhotos photos={mockProgressPhotos} />
          </div>
        </div>

        {/* Command Palette */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={handleCommandPaletteClose}
        />

        {/* Notification Center */}
        <NotificationCenter
          isOpen={isNotificationsOpen}
          onClose={handleNotificationsClose}
        />
              </div>
    </div>
  );
} 