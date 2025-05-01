export interface SubscriptionPlan {
  name: string;
  description: string;
  price: number; // in cents
  maxClients: number;
  maxCheckInsPerMonth: number;
  maxPhotosPerClient: number;
  maxStorageGB: number;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  FREE: {
    name: 'Free',
    description: 'Perfect for getting started',
    price: 0,
    maxClients: 3,
    maxCheckInsPerMonth: 12,
    maxPhotosPerClient: 10,
    maxStorageGB: 1,
    features: [
      'Up to 3 clients',
      'Basic progress tracking',
      'Limited check-ins',
      'Basic analytics'
    ]
  },
  PRO: {
    name: 'Pro',
    description: 'For growing coaching businesses',
    price: 2900, // $29/month
    maxClients: 25,
    maxCheckInsPerMonth: 100,
    maxPhotosPerClient: 50,
    maxStorageGB: 10,
    features: [
      'Up to 25 clients',
      'Advanced progress tracking',
      'Unlimited check-ins',
      'Detailed analytics',
      'Custom branding',
      'Priority support'
    ]
  },
  ELITE: {
    name: 'Elite',
    description: 'For established coaching practices',
    price: 7900, // $79/month
    maxClients: 100,
    maxCheckInsPerMonth: 500,
    maxPhotosPerClient: 100,
    maxStorageGB: 50,
    features: [
      'Up to 100 clients',
      'Advanced progress tracking',
      'Unlimited check-ins',
      'Advanced analytics & reporting',
      'Custom branding',
      'Priority support',
      'Team management',
      'API access'
    ]
  }
};

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

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