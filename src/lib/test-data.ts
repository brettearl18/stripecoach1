export const testClients = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    lastSession: '2024-03-15',
    goals: ['Weight Loss', 'Muscle Tone'],
    revenue: 2400,
    progress: 75,
    status: 'active',
    startDate: '2024-01-01',
    measurements: {
      initial: {
        weight: 165,
        bodyFat: 28,
        chest: 36,
        waist: 32,
        hips: 42,
        arms: 12,
        thighs: 22
      },
      current: {
        weight: 155,
        bodyFat: 24,
        chest: 35,
        waist: 30,
        hips: 40,
        arms: 12.5,
        thighs: 21
      }
    },
    progressPhotos: [
      {
        date: '2024-01-01',
        front: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        side: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        back: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
      },
      {
        date: '2024-02-01',
        front: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        side: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        back: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
      },
      {
        date: '2024-03-01',
        front: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        side: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
        back: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b'
      }
    ],
    subscription: {
      plan: 'Premium Coaching',
      price: 299,
      billingCycle: 'monthly',
      nextBilling: '2024-04-01',
      paymentMethod: {
        type: 'credit_card',
        last4: '4242',
        brand: 'visa',
        expiry: '12/25'
      },
      paymentHistory: [
        {
          date: '2024-03-01',
          amount: 299,
          status: 'paid'
        },
        {
          date: '2024-02-01',
          amount: 299,
          status: 'paid'
        },
        {
          date: '2024-01-01',
          amount: 299,
          status: 'paid'
        }
      ]
    },
    healthMetrics: {
      sleepQuality: [
        { date: '2024-03-15', value: 8 },
        { date: '2024-03-08', value: 7 },
        { date: '2024-03-01', value: 6 }
      ],
      energyLevels: [
        { date: '2024-03-15', value: 8 },
        { date: '2024-03-08', value: 7 },
        { date: '2024-03-01', value: 6 }
      ],
      stressLevels: [
        { date: '2024-03-15', value: 4 },
        { date: '2024-03-08', value: 5 },
        { date: '2024-03-01', value: 7 }
      ]
    },
    aiInsights: [
      {
        date: '2024-03-15',
        type: 'progress',
        message: 'Sarah has shown consistent improvement in weight loss, losing 10 pounds over 2.5 months while maintaining muscle mass. Sleep quality has improved significantly.',
        metrics: ['weight', 'sleep']
      },
      {
        date: '2024-03-08',
        type: 'recommendation',
        message: 'Based on recent stress levels, consider incorporating more meditation and recovery sessions.',
        metrics: ['stress']
      },
      {
        date: '2024-03-01',
        type: 'alert',
        message: 'Energy levels dropped below average. Reviewing nutrition and sleep patterns recommended.',
        metrics: ['energy']
      }
    ]
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    revenue: 1836.00,
    status: 'active',
    subscriptionPlan: 'Enterprise',
    startDate: '2024-02-01',
    nextBilling: '2024-03-01',
    sessions: 8,
    lastSession: '2024-02-25',
    goals: ['Muscle Gain', 'Nutrition Planning'],
    progress: 60,
    outstandingPayment: 299,
  },
  {
    id: '3',
    name: 'Emma Davis',
    email: 'emma@example.com',
    revenue: 924.02,
    status: 'active',
    subscriptionPlan: 'Basic',
    startDate: '2024-02-10',
    nextBilling: '2024-03-10',
    sessions: 4,
    lastSession: '2024-02-27',
    goals: ['Holistic Health', 'Sleep Improvement'],
    progress: 40,
    outstandingPayment: 0,
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james@example.com',
    revenue: 854.00,
    status: 'pending',
    subscriptionPlan: 'Basic',
    startDate: '2024-02-15',
    nextBilling: '2024-03-15',
    sessions: 2,
    lastSession: '2024-02-20',
    goals: ['Stress Management', 'Work-Life Balance'],
    progress: 25,
    outstandingPayment: 99,
  },
  {
    id: '5',
    name: 'Lisa Brown',
    email: 'lisa@example.com',
    revenue: 723.00,
    status: 'active',
    subscriptionPlan: 'Basic',
    startDate: '2024-02-20',
    nextBilling: '2024-03-20',
    sessions: 3,
    lastSession: '2024-02-26',
    goals: ['Nutrition Planning', 'Energy Improvement'],
    progress: 30,
    outstandingPayment: 0,
  },
];

export const revenueData = {
  daily: Array.from({ length: 10 }, (_, i) => ({
    date: new Date(2024, 1, i + 1).toISOString().split('T')[0],
    direct: Math.floor(2000 + Math.random() * 2500),
    affiliate: Math.floor(1000 + Math.random() * 1200),
    sessionsCompleted: Math.floor(3 + Math.random() * 5),
    newClients: Math.floor(Math.random() * 3),
  })),
  weekly: Array.from({ length: 4 }, (_, i) => ({
    week: `Week ${i + 1}`,
    revenue: Math.floor(15000 + Math.random() * 5000),
    sessionsCompleted: Math.floor(15 + Math.random() * 10),
    clientRetention: Math.floor(85 + Math.random() * 15),
  })),
  monthly: Array.from({ length: 6 }, (_, i) => ({
    month: new Date(2024, i, 1).toLocaleString('default', { month: 'short' }),
    revenue: Math.floor(45000 + Math.random() * 15000),
    newClients: Math.floor(8 + Math.random() * 7),
    churnRate: Math.floor(2 + Math.random() * 3),
  })),
};

export const businessInsights = {
  wins: [
    {
      metric: 'Client Success Rate',
      value: '78%',
      trend: '+12%',
      description: 'Clients achieving their primary health goals',
    },
    {
      metric: 'Session Completion',
      value: '92%',
      trend: '+5%',
      description: 'High attendance rate for scheduled sessions',
    },
    {
      metric: 'Client Satisfaction',
      value: '4.8/5',
      trend: '+0.3',
      description: 'Average rating from client feedback',
    },
  ],
  challenges: [
    {
      metric: 'Client Churn',
      value: '8%',
      trend: '+2%',
      description: 'Slight increase in subscription cancellations',
    },
    {
      metric: 'Payment Delays',
      value: '15%',
      trend: '+3%',
      description: 'Increase in delayed payments',
    },
  ],
  recommendations: [
    'Focus on client retention through personalized check-ins',
    'Implement early payment incentives to reduce outstanding payments',
    'Consider adding group sessions for improved client engagement',
  ],
};

export const subscriptionPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 99,
    features: ['1 coaching session/month', 'Email support', 'Resource library access'],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 299,
    features: ['4 coaching sessions/month', 'Priority email support', 'Resource library access', 'Weekly check-ins'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    features: ['Unlimited coaching sessions', '24/7 priority support', 'Custom resource library', 'Daily check-ins', 'Strategy planning'],
  },
];

export const metrics = {
  totalSubscriptions: 89,
  subscriptionGrowth: 4.75,
  mrr: 12456,
  mrrGrowth: 10.1,
  clv: 1245,
  clvGrowth: 2.3,
  churnRate: 2.4,
  churnRateChange: -0.3,
  activeClients: 76,
  outstandingPayments: 2145,
  averageSessionsPerClient: 6.2,
  clientSatisfaction: 4.8,
};

export const healthMetrics = {
  weeklyAverages: {
    stressLevels: 4.2,
    sleepQuality: 7.5,
    energyLevels: 6.8,
    exerciseMinutes: 45,
    waterIntake: 2100, // ml
    moodScore: 7.2,
  },
  trends: {
    stressLevels: -0.5,
    sleepQuality: +0.8,
    energyLevels: +1.2,
    exerciseMinutes: +10,
    waterIntake: +300,
    moodScore: +0.5,
  },
  alerts: [
    {
      clientId: '1',
      clientName: 'Sarah Johnson',
      metric: 'Stress Levels',
      value: 8.5,
      threshold: 7,
      priority: 'high',
    },
    {
      clientId: '3',
      clientName: 'Michael Chen',
      metric: 'Sleep Quality',
      value: 4,
      threshold: 6,
      priority: 'medium',
    },
    {
      clientId: '5',
      clientName: 'Emma Davis',
      metric: 'Exercise Minutes',
      value: 15,
      threshold: 30,
      priority: 'low',
    },
  ],
  clientProgress: [
    {
      clientId: '1',
      name: 'Sarah Johnson',
      metrics: {
        stressLevels: [6, 7, 8, 8.5, 7, 6.5, 6],
        sleepQuality: [6, 6.5, 7, 6.5, 7, 7.5, 8],
        energyLevels: [5, 5.5, 6, 6.5, 7, 7.5, 7],
        exerciseMinutes: [30, 35, 40, 45, 40, 50, 55],
        waterIntake: [1500, 1800, 2000, 2200, 2100, 2300, 2400],
        moodScore: [6, 6.5, 7, 7.5, 7, 8, 8],
      },
      goals: {
        stressLevels: 5,
        sleepQuality: 8,
        energyLevels: 8,
        exerciseMinutes: 60,
        waterIntake: 2500,
        moodScore: 8,
      },
    },
    // Add more client progress data as needed
  ],
};

export const paymentStatuses = {
  PAID: 'paid',
  FAILED: 'failed',
  PENDING: 'pending',
  REFUNDED: 'refunded',
};

export const testPayments = [
  {
    id: 'pi_1234',
    amount: 9900, // in cents
    currency: 'usd',
    status: paymentStatuses.PAID,
    created: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    customer: {
      name: 'John Doe',
      email: 'john@example.com',
    },
  },
  {
    id: 'pi_5678',
    amount: 29900,
    currency: 'usd',
    status: paymentStatuses.FAILED,
    created: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    customer: {
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
  },
  {
    id: 'pi_9012',
    amount: 99900,
    currency: 'usd',
    status: paymentStatuses.PENDING,
    created: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
    customer: {
      name: 'Bob Wilson',
      email: 'bob@example.com',
    },
  },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

export const subscriptionMetrics = {
  totalRevenue: 12500,
  activeSubscriptions: 48,
  averageSubscriptionValue: 260,
  churnRate: 2.5,
  revenueGrowth: 15.8,
  topPlan: 'Premium Monthly',
};

export const testSubscriptions = [
  {
    id: '1',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    plan: 'Premium Monthly',
    amount: 299,
    status: 'active',
    startDate: '2024-01-15',
    nextBilling: '2024-02-15',
    paymentMethod: 'Visa •••• 4242',
  },
  {
    id: '2',
    clientName: 'Sarah Wilson',
    clientEmail: 'sarah.w@example.com',
    plan: 'Basic Monthly',
    amount: 199,
    status: 'active',
    startDate: '2023-12-01',
    nextBilling: '2024-02-01',
    paymentMethod: 'Mastercard •••• 5555',
  },
  {
    id: '3',
    clientName: 'Michael Brown',
    clientEmail: 'michael.b@example.com',
    plan: 'Premium Annual',
    amount: 2990,
    status: 'active',
    startDate: '2023-06-15',
    nextBilling: '2024-06-15',
    paymentMethod: 'Visa •••• 9876',
  },
  {
    id: '4',
    clientName: 'Emily Davis',
    clientEmail: 'emily.d@example.com',
    plan: 'Basic Monthly',
    amount: 199,
    status: 'past_due',
    startDate: '2023-11-01',
    nextBilling: '2024-02-01',
    paymentMethod: 'Mastercard •••• 1234',
  },
  {
    id: '5',
    clientName: 'James Wilson',
    clientEmail: 'james.w@example.com',
    plan: 'Premium Monthly',
    amount: 299,
    status: 'canceled',
    startDate: '2023-09-01',
    nextBilling: '2024-02-01',
    paymentMethod: 'Visa •••• 5678',
  },
  {
    id: '6',
    clientName: 'Lisa Anderson',
    clientEmail: 'lisa.a@example.com',
    plan: 'Premium Monthly',
    amount: 299,
    status: 'active',
    startDate: '2024-01-01',
    nextBilling: '2024-02-01',
    paymentMethod: 'Amex •••• 3456',
  },
  {
    id: '7',
    clientName: 'Robert Martinez',
    clientEmail: 'robert.m@example.com',
    plan: 'Basic Annual',
    amount: 1990,
    status: 'active',
    startDate: '2023-08-15',
    nextBilling: '2024-08-15',
    paymentMethod: 'Visa •••• 7890',
  },
  {
    id: '8',
    clientName: 'Jennifer Taylor',
    clientEmail: 'jennifer.t@example.com',
    plan: 'Premium Monthly',
    amount: 299,
    status: 'past_due',
    startDate: '2023-12-15',
    nextBilling: '2024-02-15',
    paymentMethod: 'Mastercard •••• 4321',
  }
]; 