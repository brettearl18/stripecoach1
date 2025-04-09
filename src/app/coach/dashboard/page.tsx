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
  BrainIcon,
  ChevronDownIcon,
  PencilIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { 
  CheckInForm, 
  CheckInMetrics, 
  CheckInStatus, 
  CheckInPhoto,
  EnhancedCheckInForm,
  CoachDashboardMetrics 
} from '@/types/checkIn';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DashboardCustomizer } from '@/components/DashboardCustomizer';
import { CoachNavigation } from '@/components/navigation/CoachNavigation';

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

const mockEnhancedCheckIn: EnhancedCheckInForm = {
  id: '1',
  templateId: 'weekly-checkin',
  clientId: '1',
  name: 'Sarah Wilson',
  title: 'Weekly Check-in',
  description: 'Regular progress tracking',
  questions: [],
  answers: [],
  metrics: {
    training: 90,
    nutrition: 85,
    mindset: 75,
    recovery: 80,
    sleep: 70,
    stress: 65
  },
  status: {
    state: 'completed',
    clientProgress: 'on_track',
    lastUpdated: '2024-03-21T09:30:00Z'
  },
  streak: {
    current: 8,
    longest: 12,
    lastCheckIn: '2024-03-21T09:30:00Z',
    consistency: 92
  },
  history: {
    lastFiveCheckIns: [
      {
        id: 'check-1',
        date: '2024-03-21T09:30:00Z',
        overallScore: 85,
        metrics: {
          training: 90,
          nutrition: 85,
          mindset: 75,
          recovery: 80,
          sleep: 70,
          stress: 65
        }
      }
    ],
    trends: [
      {
        metric: 'training',
        weeklyAverage: 88,
        monthlyAverage: 85,
        trend: 'up'
      }
    ]
  },
  coachInteraction: {
    lastReview: '2024-03-21T10:30:00Z',
    averageResponseTime: 120,
    totalReviews: 24,
    lastFeedback: {
      date: '2024-03-21T10:30:00Z',
      summary: 'Great progress this week!',
      action_items: ['Focus on sleep quality', 'Work on stress management']
    }
  },
  engagement: {
    photoSubmissions: 8,
    commentResponses: 12,
    actionItemsCompleted: 18,
    totalActionItems: 20
  },
  dueDate: '2024-03-21T09:30:00Z',
  completedAt: '2024-03-21T09:30:00Z',
  createdAt: '2024-03-21T09:30:00Z',
  updatedAt: '2024-03-21T10:30:00Z'
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

const mockClientProgress: EnhancedCheckInForm[] = [mockEnhancedCheckIn];

const mockProgressPhotos: CheckInPhoto[] = [
  {
    id: 'p1',
    url: '/progress-photos/sarah-progress-1.jpg',
    type: 'progress',
    date: '2024-03-21',
    notes: 'Weekly progress update'
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

export default function CoachDashboard() {
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('week');
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [expandedClients, setExpandedClients] = useState<string[]>([]);
  const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [lastAnalyzedCheckInId, setLastAnalyzedCheckInId] = useState<string | null>(null);

  // Fix the section preferences state with correct types
  const [sectionPreferences, setSectionPreferences] = useState<{[key: string]: SectionPreference}>({
    'quick-stats': { isVisible: true, order: 0, columnSpan: 3 },
    'client-progress': { isVisible: true, order: 1, columnSpan: 2 },
    'client-of-week': { isVisible: true, order: 2, columnSpan: 1 },
    'priority-actions': { isVisible: true, order: 3, columnSpan: 1 },
    'upcoming-checkins': { isVisible: true, order: 4, columnSpan: 1 },
    'progress-photos': { isVisible: true, order: 5, columnSpan: 1 },
    'ai-insights': { isVisible: true, order: 6, columnSpan: 3 }
  });

  // Add useEffect to listen for preference changes
  useEffect(() => {
    const handlePreferencesUpdate = (event: CustomEvent<{ sections: Array<{ id: string; isVisible: boolean; order: number; columnSpan: 1 | 2 | 3 }> }>) => {
      const newPreferences = event.detail.sections.reduce((acc, section) => {
        acc[section.id] = {
          isVisible: section.isVisible,
          order: section.order,
          columnSpan: section.columnSpan
        };
        return acc;
      }, {} as {[key: string]: SectionPreference});
      setSectionPreferences(newPreferences);
    };

    window.addEventListener('dashboardPreferencesUpdated', handlePreferencesUpdate as EventListener);
    return () => {
      window.removeEventListener('dashboardPreferencesUpdated', handlePreferencesUpdate as EventListener);
    };
  }, []);

  const toggleClientExpanded = (clientId: string) => {
    setExpandedClients(prev => 
      prev.includes(clientId) 
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable', change: number) => {
    if (trend === 'up') {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />;
    } else if (trend === 'down') {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-red-500 transform rotate-180" />;
    }
    return <ArrowTrendingUpIcon className="w-4 h-4 text-gray-400 transform rotate-90" />;
  };

  const getInsightIcon = (type: 'success' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />;
      default:
        return <BoltIcon className="w-5 h-5 text-blue-500" />;
    }
  };

  const loadAIInsights = useCallback(async (force = false) => {
    if (!force && isLoadingInsights) return;
    
    // Get the latest check-in
    const latestCheckIn = mockClientProgress[0];
    
    // Skip if we've already analyzed this check-in and it's not a forced refresh
    if (!force && lastAnalyzedCheckInId === latestCheckIn.id) {
      return;
    }
    
    setIsLoadingInsights(true);
    setRetryCount(0);
    
    try {
      const insights = await fetchAIInsights([latestCheckIn]);
      setAIAnalysis(insights);
      setLastAnalyzedCheckInId(latestCheckIn.id);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load AI insights:', error);
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadAIInsights(true), 1000 * (retryCount + 1));
      }
    } finally {
      setIsLoadingInsights(false);
    }
  }, [isLoadingInsights, retryCount, lastAnalyzedCheckInId]);

  // Only load insights when component mounts or when forced
  useEffect(() => {
    loadAIInsights();
  }, []);  // Remove loadAIInsights from dependencies

  const renderAIInsights = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow transition-colors duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <SparklesIcon className="w-8 h-8 text-indigo-500" />
            AI Group Insights
          </h2>
          <div className="flex items-center gap-4">
            {isLoadingInsights ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {retryCount > 0 ? `Retrying (${retryCount}/3)...` : 'Analyzing...'}
                </span>
              </div>
            ) : (
              <>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {formatDate(lastUpdated.toISOString())}
                </span>
                <button 
                  onClick={() => loadAIInsights(true)}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors duration-200"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Refresh
                </button>
              </>
            )}
          </div>
        </div>

        {aiAnalysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Metrics */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FaceSmileIcon className="w-5 h-5 text-yellow-500" />
                Group Sentiment
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {aiAnalysis.overallMood.map((metric) => (
                  <div key={metric.category} className="bg-white dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{metric.category}</span>
                      {getTrendIcon(metric.trend, metric.change)}
                    </div>
                    <div className="mt-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{metric.score}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">/10</span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {metric.change > 0 ? '+' : ''}{metric.change} this week
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Wins & Challenges */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-500" />
                  Wins & Challenges
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Recent Wins</h4>
                  <ul className="space-y-2">
                    {aiAnalysis.recentWins.slice(0, 2).map((win, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{win}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Current Challenges</h4>
                  <ul className="space-y-2">
                    {aiAnalysis.commonChallenges.slice(0, 2).map((challenge, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BoltIcon className="w-5 h-5 text-blue-500" />
                Action Items
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Key Insights</h4>
                  <ul className="space-y-3">
                    {aiAnalysis.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2 bg-white dark:bg-gray-700 rounded-lg p-3">
                        {getInsightIcon(insight.type)}
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{insight.message}</p>
                          <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${
                            insight.impact === 'high' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : insight.impact === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {insight.impact} impact
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recommended Focus Areas</h4>
                  <ul className="space-y-3">
                    {aiAnalysis.focusAreas.map((area, index) => (
                      <li key={index} className="flex items-start gap-2 bg-white dark:bg-gray-700 rounded-lg p-3">
                        <BoltIcon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Helper function to get column span class
  const getColumnSpanClass = (sectionId: string): string => {
    const section = sectionPreferences[sectionId];
    if (!section) return '';
    return `lg:col-span-${section.columnSpan}`;
  };

  // Helper function to render sections in order
  const renderOrderedSections = () => {
    const sections = Object.entries(sectionPreferences)
      .sort(([, a], [, b]) => a.order - b.order)
      .filter(([, { isVisible }]) => isVisible)
      .map(([id]) => id);

    return sections.map(sectionId => {
      switch (sectionId) {
        case 'quick-stats':
          return (
            <div key={sectionId} className={`${getColumnSpanClass(sectionId)} flex overflow-x-auto pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 -mx-2 px-2 sm:mx-0 sm:px-0`}>
              {/* Quick Stats content */}
              <div className="min-w-[180px] sm:min-w-0 bg-white dark:bg-gray-800 rounded-xl p-4 flex-shrink-0 sm:flex-shrink">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Check-ins Today</p>
                    <div className="mt-2 flex items-baseline">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{mockMetrics.completedCheckIns}</h3>
                      <span className="ml-2 text-sm text-gray-500">/ {mockMetrics.totalClients}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(mockMetrics.completedCheckIns / mockMetrics.totalClients) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="min-w-[180px] sm:min-w-0 bg-white dark:bg-gray-800 rounded-xl p-4 flex-shrink-0 sm:flex-shrink">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Needs Attention</p>
                    <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                      {mockMetrics.clientProgress.needsAttention}
                    </h3>
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <ExclamationCircleIcon className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href="/coach/clients?filter=needs_attention"
                    className="text-sm text-yellow-500 hover:text-yellow-600 font-medium"
                  >
                    View clients
                  </Link>
                  <ChevronRightIcon className="w-4 h-4 text-yellow-500" />
                </div>
              </div>

              <div className="min-w-[180px] sm:min-w-0 bg-white dark:bg-gray-800 rounded-xl p-4 flex-shrink-0 sm:flex-shrink">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Weekly Engagement</p>
                    <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                      {mockMetrics.weeklyEngagement}%
                    </h3>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <FireIcon className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${mockMetrics.weeklyEngagement}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="min-w-[180px] sm:min-w-0 bg-white dark:bg-gray-800 rounded-xl p-4 flex-shrink-0 sm:flex-shrink">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Improving Clients</p>
                    <h3 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                      {mockMetrics.clientProgress.improving}
                    </h3>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-lg">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href="/coach/clients?filter=improving"
                    className="text-sm text-purple-500 hover:text-purple-600 font-medium"
                  >
                    View progress
                  </Link>
                  <ChevronRightIcon className="w-4 h-4 text-purple-500" />
                </div>
              </div>
            </div>
          );
        case 'client-progress':
          return (
            <div key={sectionId} className={`${getColumnSpanClass(sectionId)} space-y-4`}>
              {/* Client Progress content */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <UserGroupIcon className="w-6 h-6 text-indigo-500" />
                    Client Progress
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {mockClientProgress.length} Active Clients
                    </span>
                    <button className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 p-1 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors">
                      <ArrowsPointingOutIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {mockClientProgress.map((checkIn) => (
                    <motion.div 
                      key={checkIn.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-200"
                    >
                      <div 
                        className="p-5 cursor-pointer"
                        onClick={() => toggleClientExpanded(checkIn.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
                                <UserGroupIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                              </div>
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                                checkIn.status.clientProgress === 'on_track' ? 'bg-green-500' :
                                checkIn.status.clientProgress === 'needs_attention' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`} />
                            </div>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {checkIn.name}
                              </h3>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  getStatusColor(checkIn.status.clientProgress)
                                }`}>
                                  {getStatusIcon(checkIn.status.clientProgress)}
                                  <span className="ml-1">
                                    {checkIn.status.clientProgress.replace('_', ' ').charAt(0).toUpperCase() + 
                                     checkIn.status.clientProgress.replace('_', ' ').slice(1)}
                                  </span>
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <ClockIcon className="w-4 h-4" />
                                  Updated {formatDate(checkIn.status.lastUpdated)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            {/* Progress Circle */}
                            <div className="text-center">
                              <div className="relative inline-flex">
                                <div className="w-16 h-16">
                                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <circle
                                      cx="18"
                                      cy="18"
                                      r="16"
                                      fill="none"
                                      className="stroke-current text-gray-100 dark:text-gray-700"
                                      strokeWidth="2.5"
                                    />
                                    <circle
                                      cx="18"
                                      cy="18"
                                      r="16"
                                      fill="none"
                                      className="stroke-current text-indigo-500"
                                      strokeWidth="2.5"
                                      strokeDasharray={100}
                                      strokeDashoffset={100 - getAverageProgress(checkIn.metrics)}
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                      {getAverageProgress(checkIn.metrics)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
                            </div>

                            <div className="flex items-center gap-3">
                              <Link
                                href={`/coach/clients/${checkIn.clientId}`}
                                className="inline-flex items-center px-3 py-2 border border-indigo-100 dark:border-indigo-900 text-sm font-medium rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                View Check-in
                              </Link>
                              <button 
                                className={`p-2 rounded-lg text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                  expandedClients.includes(checkIn.id) ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                                }`}
                              >
                                <ChevronDownIcon 
                                  className={`w-5 h-5 transition-transform duration-200 ${
                                    expandedClients.includes(checkIn.id) ? 'transform rotate-180' : ''
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {expandedClients.includes(checkIn.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-5 pb-5"
                        >
                          <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                              {Object.entries(checkIn.metrics).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{key}</span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{value}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className={`h-2 rounded-full transition-all duration-500 ${
                                        key === 'training' ? 'bg-blue-500' :
                                        key === 'nutrition' ? 'bg-green-500' :
                                        key === 'mindset' ? 'bg-purple-500' :
                                        key === 'recovery' ? 'bg-orange-500' :
                                        key === 'sleep' ? 'bg-indigo-500' :
                                        'bg-red-500'
                                      }`}
                                      style={{ width: `${value}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* New AI Summary Section */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4 text-indigo-500" />
                                AI Summary
                              </h4>
                              <div className="space-y-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {mockClientAIInsights.summary}
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {/* Strengths */}
                                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                    <h5 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Strengths</h5>
                                    <ul className="space-y-2">
                                      {mockClientAIInsights.strengths.map((strength, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                          <span className="text-sm text-gray-700 dark:text-gray-300">{strength}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  {/* Challenges */}
                                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                    <h5 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-2">Areas for Improvement</h5>
                                    <ul className="space-y-2">
                                      {mockClientAIInsights.challenges.map((challenge, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <ExclamationCircleIcon className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                          <span className="text-sm text-gray-700 dark:text-gray-300">{challenge}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>

                                {/* Trends */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                  <h5 className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">Key Trends</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {mockClientAIInsights.trends.map((trend, index) => (
                                      <div key={index} className="flex items-start gap-2">
                                        {trend.status === 'improving' ? (
                                          <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        ) : trend.status === 'declining' ? (
                                          <ArrowTrendingUpIcon className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5 transform rotate-180" />
                                        ) : (
                                          <ArrowTrendingUpIcon className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5 transform rotate-90" />
                                        )}
                                        <div>
                                          <span className="text-sm font-medium text-gray-900 dark:text-white">{trend.metric}</span>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">{trend.insight}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Recommendations */}
                                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                                    <h5 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">AI Recommendations</h5>
                                    <ul className="space-y-2">
                                      {mockClientAIInsights.recommendations.map((recommendation, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <BoltIcon className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                                          <span className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Enhanced Metrics Grid */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                  <FireIcon className="w-4 h-4 text-orange-500" />
                                  Check-in Streak
                                </h4>
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Current</span>
                                    <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                      {checkIn.streak.current} days
                                      {checkIn.streak.current >= 5 && 
                                        <FireIcon className="w-4 h-4 text-orange-500 animate-pulse" />
                                      }
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Longest</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                      {checkIn.streak.longest} days
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-500">Consistency</span>
                                    <div className="flex items-center gap-2">
                                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div 
                                          className="h-2 bg-green-500 rounded-full"
                                          style={{ width: `${checkIn.streak.consistency}%` }}
                                        />
                                      </div>
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {checkIn.streak.consistency}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                  <ChartBarIcon className="w-4 h-4 text-blue-500" />
                                  Progress Trends
                                </h4>
                                <div className="space-y-3">
                                  {checkIn.history.trends.map((trend) => (
                                    <div key={trend.metric} className="flex items-center justify-between">
                                      <span className="text-sm text-gray-500 capitalize">{trend.metric}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          {trend.weeklyAverage}%
                                        </span>
                                        {getTrendIcon(trend.trend, 0)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          );
        case 'client-of-week':
          return (
            <div key={sectionId} className={`${getColumnSpanClass(sectionId)} bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 sm:p-6 text-white`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-2 sm:mb-0">
                  <TrophyIcon className="w-5 h-5 text-yellow-400" />
                  Client of the Week
                </h2>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  Week 12
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  {mockClientOfTheWeek.avatar ? (
                    <img
                      src={mockClientOfTheWeek.avatar}
                      alt={mockClientOfTheWeek.name}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <UserGroupIcon className="w-8 h-8 text-white/70" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-lg">{mockClientOfTheWeek.name}</h3>
                  <p className="text-white/80 text-sm">{mockClientOfTheWeek.achievement}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* Workouts Stats */}
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white/80">Workouts</span>
                    {getTrendIcon(mockClientOfTheWeek.stats.workouts.trend, mockClientOfTheWeek.stats.workouts.change)}
                  </div>
                  <div className="text-lg font-semibold">
                    {mockClientOfTheWeek.stats.workouts.completed}/{mockClientOfTheWeek.stats.workouts.total}
                  </div>
                  <div className="text-xs text-white/60">
                    +{mockClientOfTheWeek.stats.workouts.change} from last week
                  </div>
                </div>

                {/* Nutrition Stats */}
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white/80">Nutrition</span>
                    {getTrendIcon(mockClientOfTheWeek.stats.nutrition.trend, mockClientOfTheWeek.stats.nutrition.change)}
                  </div>
                  <div className="text-lg font-semibold">
                    {mockClientOfTheWeek.stats.nutrition.percentage}%
                  </div>
                  <div className="text-xs text-white/60">
                    +{mockClientOfTheWeek.stats.nutrition.change}% from last week
                  </div>
                </div>

                {/* Steps Stats */}
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white/80">Steps</span>
                    {getTrendIcon(mockClientOfTheWeek.stats.steps.trend, mockClientOfTheWeek.stats.steps.change)}
                  </div>
                  <div className="text-lg font-semibold">
                    {(mockClientOfTheWeek.stats.steps.average / 1000).toFixed(1)}k
                  </div>
                  <div className="text-xs text-white/60">
                    +{(mockClientOfTheWeek.stats.steps.change / 1000).toFixed(1)}k avg
                  </div>
                </div>
              </div>
            </div>
          );
        case 'priority-actions':
          return (
            <div key={sectionId} className={`${getColumnSpanClass(sectionId)} bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6`}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Priority Actions
              </h2>
              <div className="space-y-4">
                <Link
                  href="/coach/check-ins?status=pending"
                  className="block p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-500/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BellIcon className="w-5 h-5 text-yellow-500" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Pending Check-ins
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {mockMetrics.pendingCheckIns} clients need review
                        </p>
                      </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>

                <Link
                  href="/coach/clients?status=at_risk"
                  className="block p-4 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          At-Risk Clients
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {mockMetrics.clientProgress.needsAttention} clients need attention
                        </p>
                      </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>

                <Link
                  href="/coach/templates"
                  className="block p-4 bg-purple-50 dark:bg-purple-500/10 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <SparklesIcon className="w-5 h-5 text-purple-500" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          Weekly Planning
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Plan next week's focus areas
                        </p>
                      </div>
                    </div>
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              </div>
            </div>
          );
        case 'upcoming-checkins':
          return (
            <div key={sectionId} className={`${getColumnSpanClass(sectionId)} bg-white dark:bg-gray-800 rounded-xl p-6`}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upcoming Check-ins
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Today
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        5 check-ins due
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/coach/check-ins?date=today"
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    View
                  </Link>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Tomorrow
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        8 check-ins scheduled
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/coach/check-ins?date=tomorrow"
                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          );
        case 'progress-photos':
          return (
            <div key={sectionId} className={`${getColumnSpanClass(sectionId)} bg-white dark:bg-gray-800 rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Progress Photos
                </h2>
                <Link
                  href="/coach/progress-photos"
                  className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                >
                  View all
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {mockProgressPhotos.map((photo) => (
                  <div 
                    key={photo.id}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {/* Fallback for demo - replace with actual Image component when photos are available */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PhotoIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      {/* Uncomment when you have actual photos
                      <Image
                        src={photo.photoUrl}
                        alt={`Progress photo from ${photo.clientName}`}
                        fill
                        className="object-cover"
                      />
                      */}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                      <ArrowsPointingOutIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/50 to-transparent rounded-b-lg">
                      <p className="text-xs text-white font-medium truncate">
                        {photo.clientName}
                      </p>
                      <p className="text-xs text-gray-200">
                        {formatDate(photo.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'ai-insights':
          return (
            <div key={sectionId} className={`${getColumnSpanClass(sectionId)}`}>
              {renderAIInsights()}
            </div>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Coach Dashboard</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Check-ins Today</h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-semibold text-white">{mockMetrics.completedCheckIns}</p>
              <p className="text-sm text-gray-400">/ {mockMetrics.totalClients}</p>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-4">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(mockMetrics.completedCheckIns / mockMetrics.totalClients) * 100}%` }}></div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Needs Attention</h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-semibold text-white">{mockMetrics.clientProgress.needsAttention}</p>
              <button className="text-sm text-yellow-400 hover:text-yellow-300">View clients</button>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Weekly Engagement</h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-semibold text-white">{mockMetrics.weeklyEngagement}%</p>
              <div className="w-24 h-8 bg-green-500/20 rounded">
                <div className="bg-green-500 h-full rounded" style={{ width: `${mockMetrics.weeklyEngagement}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Improving Clients</h3>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-semibold text-white">{mockMetrics.clientProgress.improving}</p>
              <button className="text-sm text-purple-400 hover:text-purple-300">View progress</button>
            </div>
          </div>
        </div>

        {/* Client Progress and Actions */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5M8 8v8m8-16l4 4-4 4m-4-4l4-4-4-4m-4 4l4 4-4 4" />
                </svg>
                <h2 className="text-lg font-semibold text-white">Client Progress</h2>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>{mockMetrics.totalClients} Active Clients</span>
                <button className="p-1 hover:bg-gray-700 rounded">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Client Progress Card */}
            <div className="bg-gray-800/50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">Sarah Wilson</h3>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-green-400">On track</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-400">Updated 21/03/2024</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-700"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-blue-500"
                        strokeWidth="8"
                        strokeDasharray={78.5 * 3.14}
                        strokeDashoffset={78.5 * 3.14 * 0.22}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="40"
                        cx="50"
                        cy="50"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">78%</span>
                    </div>
                  </div>
                  <button className="text-blue-400 hover:text-blue-300">View Check-in</button>
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Priority Actions */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4">Priority Actions</h2>
              <div className="space-y-4">
                <div className="bg-yellow-500/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h3 className="text-white font-medium">Pending Check-ins</h3>
                        <p className="text-sm text-gray-400">5 clients need review</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-yellow-500/20 rounded">
                      <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="bg-red-500/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <h3 className="text-white font-medium">At-Risk Clients</h3>
                        <p className="text-sm text-gray-400">5 clients need attention</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-red-500/20 rounded">
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="bg-purple-500/10 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <div>
                        <h3 className="text-white font-medium">Weekly Planning</h3>
                        <p className="text-sm text-gray-400">Plan next week's focus areas</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-purple-500/20 rounded">
                      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Check-ins */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Upcoming Check-ins</h2>
              <div className="space-y-4">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-sm font-medium text-white">Today</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">5 check-ins due</p>
                      </div>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300">View</button>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-sm font-medium text-white">Tom</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">8 check-ins scheduled</p>
                      </div>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300">View</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client of the Week */}
        <div className="mt-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 01.894.553l2.991 5.657 6.182.902a1 1 0 01.553 1.705l-4.465 4.474 1.054 6.174a1 1 0 01-1.45 1.054L10 18.897l-5.758 3.027a1 1 0 01-1.45-1.054l1.054-6.174L.381 10.722a1 1 0 01.553-1.705l6.182-.902L10.106 2.553A1 1 0 0110 2z" clipRule="evenodd" />
                </svg>
                <h2 className="text-lg font-semibold text-white">Client of the Week</h2>
              </div>
              <span className="text-sm text-blue-200">Week 12</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium">Sarah Wilson</h3>
                <p className="text-blue-200 text-sm">Most Consistent Progress</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 rounded p-4">
                <h4 className="text-blue-200 text-sm mb-2">Workouts</h4>
                <p className="text-white text-xl font-semibold">6/6</p>
                <p className="text-blue-200 text-xs mt-1">+1 from last week</p>
              </div>
              <div className="bg-white/10 rounded p-4">
                <h4 className="text-blue-200 text-sm mb-2">Nutrition</h4>
                <p className="text-white text-xl font-semibold">95%</p>
                <p className="text-blue-200 text-xs mt-1">+5% from last week</p>
              </div>
              <div className="bg-white/10 rounded p-4">
                <h4 className="text-blue-200 text-sm mb-2">Steps</h4>
                <p className="text-white text-xl font-semibold">12.0k</p>
                <p className="text-blue-200 text-xs mt-1">+2.0k avg</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Progress Photos */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Progress Photos</h2>
            <button className="text-blue-400 hover:text-blue-300 text-sm">View all</button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {/* Photo placeholders */}
            <div className="aspect-square bg-gray-800/50 rounded-lg"></div>
            <div className="aspect-square bg-gray-800/50 rounded-lg"></div>
            <div className="aspect-square bg-gray-800/50 rounded-lg"></div>
            <div className="aspect-square bg-gray-800/50 rounded-lg"></div>
          </div>
        </div>

        {/* AI Group Insights */}
        <div className="mt-8">
          <div className="bg-gray-800/50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h2 className="text-lg font-semibold text-white">AI Group Insights</h2>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">Last updated: 09/04/2025</span>
                <button className="text-blue-400 hover:text-blue-300">Refresh</button>
              </div>
            </div>
            {/* AI insights content would go here */}
          </div>
        </div>
      </main>
    </div>
  );
} 