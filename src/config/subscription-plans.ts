export type SubscriptionPlan = 'BASIC' | 'PRO' | 'ENTERPRISE';

export interface PlanFeatures {
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  maxClients: number;
  maxCoaches: number;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, PlanFeatures> = {
  BASIC: {
    name: 'Basic',
    description: 'Perfect for individual coaches',
    price: 49,
    interval: 'month',
    features: [
      'Up to 10 clients',
      'Basic progress tracking',
      'Check-in system',
      'Email support',
      'Basic analytics'
    ],
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic',
    maxClients: 10,
    maxCoaches: 1
  },
  PRO: {
    name: 'Pro',
    description: 'For growing coaching businesses',
    price: 99,
    interval: 'month',
    features: [
      'Up to 50 clients',
      'Advanced progress tracking',
      'Custom check-in templates',
      'Priority support',
      'Advanced analytics',
      'Program templates',
      'Resource library'
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    maxClients: 50,
    maxCoaches: 3
  },
  ENTERPRISE: {
    name: 'Enterprise',
    description: 'For established coaching organizations',
    price: 249,
    interval: 'month',
    features: [
      'Unlimited clients',
      'Custom integrations',
      'Dedicated support',
      'White-label options',
      'Advanced security',
      'Custom reporting',
      'API access',
      'Team management'
    ],
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    maxClients: -1, // Unlimited
    maxCoaches: -1 // Unlimited
  }
};

export const FEATURES_BY_PLAN = {
  clientLimit: {
    free: 5,
    pro: 30,
    enterprise: Infinity
  },
  coachLimit: {
    free: 1,
    pro: 1,
    enterprise: Infinity
  },
  customForms: {
    free: false,
    pro: true,
    enterprise: true
  },
  whiteLabel: {
    free: false,
    pro: false,
    enterprise: true
  },
  apiAccess: {
    free: false,
    pro: false,
    enterprise: true
  }
} as const; 