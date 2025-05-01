import { cache } from 'react';
import {
  getUsers,
  getPayments,
  getCheckIns,
  getMessages,
  getAlerts,
  type User,
  type Payment,
  type CheckIn,
  type Message,
  type Alert,
  type Client
} from './firebaseService';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

export interface DashboardMetrics {
  totalRevenue: {
    value: number;
    change: string;
    trend: number[];
  };
  activeCoaches: {
    value: number;
    change: string;
    trend: number[];
  };
  totalClients: {
    value: number;
    change: string;
    trend: number[];
  };
}

export interface CoachPerformance {
  id: string;
  name: string;
  email: string;
  clients: {
    active: number;
    total: number;
  };
  revenue: number;
  completionRate: number;
  responseTime: number;
  healthScore: number;
}

export interface ClientAlert {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
}

export interface ClientProgress {
  month: string;
  clients: number;
  progress: number;
}

export interface SubscriptionMetrics {
  activeSubscriptions: number;
  atRiskSubscriptions: number;
  churnedSubscriptions: number;
  monthlyRecurringRevenue: number;
  averageSubscriptionValue: number;
  churnRate: number;
}

export interface AccountHealthMetric {
  name: string;
  description: string;
  score: number;
}

export interface AccountHealth {
  overallScore: number;
  metrics: AccountHealthMetric[];
}

// Cache the dashboard metrics for 5 minutes
export const getDashboardMetrics = cache(async () => {
  try {
    // Get total revenue for current and previous month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [currentMonthPayments, previousMonthPayments] = await Promise.all([
      getPayments('completed'),
      getPayments('completed')
    ]);

    const currentMonthRevenue = currentMonthPayments
      .filter(p => new Date(p.createdAt) >= firstDayOfMonth)
      .reduce((sum, p) => sum + p.amount, 0);

    const previousMonthRevenue = previousMonthPayments
      .filter(p => new Date(p.createdAt) >= firstDayOfLastMonth && new Date(p.createdAt) < firstDayOfMonth)
      .reduce((sum, p) => sum + p.amount, 0);

    // Get coach counts
    const [activeCoaches, previousActiveCoaches] = await Promise.all([
      getUsers('COACH', 'ACTIVE'),
      getUsers('COACH', 'ACTIVE')
    ]);

    const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7));
    const currentActiveCoaches = activeCoaches.length;
    const previousActiveCoachCount = previousActiveCoaches.filter(c => new Date(c.createdAt) < sevenDaysAgo).length;

    // Get client counts
    const [activeClients, previousActiveClients] = await Promise.all([
      getUsers('CLIENT', 'ACTIVE'),
      getUsers('CLIENT', 'ACTIVE')
    ]);

    const currentTotalClients = activeClients.length;
    const previousTotalClients = previousActiveClients.filter(c => new Date(c.createdAt) < sevenDaysAgo).length;

    // Calculate changes
    const revenueChange = ((currentMonthRevenue - previousMonthRevenue) / (previousMonthRevenue || 1)) * 100;
    const coachChange = currentActiveCoaches - previousActiveCoachCount;
    const clientChange = currentTotalClients - previousTotalClients;

    return {
      totalRevenue: {
        value: currentMonthRevenue,
        change: `${revenueChange >= 0 ? '+' : ''}${revenueChange.toFixed(1)}% from last month`,
        trend: await getRevenueTrend()
      },
      activeCoaches: {
        value: currentActiveCoaches,
        change: `${coachChange >= 0 ? '+' : ''}${coachChange} this week`,
        trend: await getCoachTrend()
      },
      totalClients: {
        value: currentTotalClients,
        change: `${clientChange >= 0 ? '+' : ''}${clientChange} this week`,
        trend: await getClientTrend()
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    throw error;
  }
});

// Cache coach performance data for 5 minutes
export const getCoachPerformance = cache(async () => {
  try {
    const coaches = await getUsers('COACH', 'ACTIVE');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const coachPerformance = await Promise.all(
      coaches.map(async (coach) => {
        const [clients, checkIns, messages] = await Promise.all([
          getUsers('CLIENT', 'ACTIVE'),
          getCheckIns(coach.id),
          getMessages(coach.id)
        ]);

        const coachClients = clients.filter(client => (client as any).coachId === coach.id);
        const recentCheckIns = checkIns.filter(ci => new Date(ci.createdAt) >= thirtyDaysAgo);
        const recentMessages = messages.filter(m => new Date(m.createdAt) >= thirtyDaysAgo);

        return {
          id: coach.id,
          name: coach.name || '',
          email: coach.email,
          clients: {
            active: coachClients.length,
            total: coachClients.length
          },
          revenue: 0, // Assuming revenue is not available in the current data
          completionRate: calculateCompletionRate(recentCheckIns),
          responseTime: calculateResponseTime(recentMessages),
          healthScore: 0, // Assuming healthScore is not available in the current data
        };
      })
    );

    return coachPerformance.sort((a, b) => b.completionRate - a.completionRate);
  } catch (error) {
    console.error('Error fetching coach performance:', error);
    throw error;
  }
});

// Cache client alerts for 1 minute
export const getClientAlerts = cache(async () => {
  try {
    const alerts = await getAlerts(false);
    return alerts.slice(0, 5).map(alert => ({
      id: alert.id,
      title: alert.message,
      description: alert.message,
      severity: 'high' as 'high' | 'medium' | 'low',
      timestamp: alert.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('Error fetching client alerts:', error);
    throw error;
  }
});

// Cache client progress data for 1 hour
export const getClientProgress = cache(async () => {
  try {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    const progress = await Promise.all(
      months.slice(0, currentMonth + 1).map(async (month) => {
        const monthIndex = months.indexOf(month);
        const startDate = new Date(new Date().getFullYear(), monthIndex, 1);
        const endDate = new Date(new Date().getFullYear(), monthIndex + 1, 0);

        const [clients, checkIns] = await Promise.all([
          getUsers('CLIENT', 'ACTIVE'),
          getCheckIns()
        ]);

        const monthlyClients = clients.filter(c => new Date(c.createdAt) <= endDate);
        const monthlyCheckIns = checkIns.filter(
          ci => new Date(ci.createdAt) >= startDate && new Date(ci.createdAt) <= endDate
        );

        return {
          month,
          clients: monthlyClients.length,
          progress: calculateMonthlyProgress(monthlyCheckIns)
        };
      })
    );

    return progress;
  } catch (error) {
    console.error('Error fetching client progress:', error);
    throw error;
  }
});

// Helper functions
async function getRevenueTrend() {
  const last5Months = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      start: new Date(date.getFullYear(), date.getMonth(), 1),
      end: new Date(date.getFullYear(), date.getMonth() + 1, 0)
    };
  }).reverse();

  const payments = await getPayments('completed');
  
  return last5Months.map(({ start, end }) => {
    return payments
      .filter(p => new Date(p.createdAt) >= start && new Date(p.createdAt) <= end)
      .reduce((sum, p) => sum + p.amount, 0);
  });
}

async function getCoachTrend() {
  const last5Months = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }).reverse();

  const coaches = await getUsers('COACH', 'ACTIVE');
  
  return last5Months.map(date => {
    return coaches.filter(c => new Date(c.createdAt) <= date).length;
  });
}

async function getClientTrend() {
  const last5Months = Array.from({ length: 5 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  }).reverse();

  const clients = await getUsers('CLIENT', 'ACTIVE');
  
  return last5Months.map(date => {
    return clients.filter(c => new Date(c.createdAt) <= date).length;
  });
}

function calculateCompletionRate(checkIns: CheckIn[]) {
  if (checkIns.length === 0) return 100;
  const completed = checkIns.filter(ci => ci.status === 'COMPLETED').length;
  return Math.round((completed / checkIns.length) * 100);
}

function calculateResponseTime(messages: Message[]) {
  if (messages.length === 0) return 0;
  const responseTimes = messages
    .filter(m => m.responseTime !== undefined)
    .map(m => m.responseTime!);
  return Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
}

function calculateClientProgress(clients: User[]) {
  const progress = {
    success: 0,
    warning: 0,
    neutral: 0
  };

  clients.forEach(client => {
    // Assuming client has a progress field
    const clientProgress = (client as any).progress || 0;
    if (clientProgress >= 80) progress.success++;
    else if (clientProgress >= 50) progress.neutral++;
    else progress.warning++;
  });

  return progress;
}

function calculateMonthlyProgress(checkIns: CheckIn[]) {
  if (checkIns.length === 0) return 0;
  const totalProgress = checkIns.reduce((sum, ci) => sum + (ci.progress || 0), 0);
  return Math.round(totalProgress / checkIns.length);
}

export async function getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
  // In development, return mock data
  if (process.env.NODE_ENV === 'development') {
    return {
      activeSubscriptions: 145,
      atRiskSubscriptions: 12,
      churnedSubscriptions: 8,
      monthlyRecurringRevenue: 25000,
      averageSubscriptionValue: 172,
      churnRate: 5.2,
    };
  }

  // TODO: Implement real data fetching from Firestore
  const subscriptionsRef = collection(db, 'subscriptions');
  const snapshot = await getDocs(subscriptionsRef);
  // Process and return real data
  return {} as SubscriptionMetrics;
}

export async function getAccountHealth(): Promise<AccountHealth> {
  // In development, return mock data
  if (process.env.NODE_ENV === 'development') {
    return {
      overallScore: 85,
      metrics: [
        {
          name: 'Client Engagement',
          description: 'Average client activity and interaction',
          score: 88,
        },
        {
          name: 'Coach Performance',
          description: 'Response times and client satisfaction',
          score: 92,
        },
        {
          name: 'Payment Health',
          description: 'Payment success rate and subscription status',
          score: 95,
        },
        {
          name: 'Platform Usage',
          description: 'Feature adoption and usage patterns',
          score: 82,
        },
        {
          name: 'Client Retention',
          description: 'Client churn rate and loyalty metrics',
          score: 78,
        },
      ],
    };
  }

  // TODO: Implement real data fetching from Firestore
  const healthRef = collection(db, 'account_health');
  const snapshot = await getDocs(healthRef);
  // Process and return real data
  return {} as AccountHealth;
} 