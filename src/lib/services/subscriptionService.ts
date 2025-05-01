import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  limits: {
    coaches: number;
    clients: number;
  };
}

export interface Subscription {
  id: string;
  companyId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export const DEFAULT_PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small coaching practices',
    price: 49,
    features: [
      'Basic coach management',
      'Client scheduling',
      'Basic reporting'
    ],
    limits: {
      coaches: 2,
      clients: 50
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing coaching businesses',
    price: 149,
    features: [
      'Advanced coach management',
      'Client scheduling',
      'Advanced reporting',
      'Custom branding',
      'API access'
    ],
    limits: {
      coaches: 10,
      clients: 200
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large coaching organizations',
    price: 499,
    features: [
      'Unlimited coach management',
      'Client scheduling',
      'Advanced reporting',
      'Custom branding',
      'API access',
      'Priority support',
      'Custom integrations'
    ],
    limits: {
      coaches: -1, // Unlimited
      clients: -1 // Unlimited
    }
  }
];

export async function getCompanySubscription(companyId: string): Promise<Subscription | null> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', companyId);
    const subscriptionSnap = await getDoc(subscriptionRef);
    
    if (!subscriptionSnap.exists()) {
      return null;
    }

    return {
      id: subscriptionSnap.id,
      ...subscriptionSnap.data()
    } as Subscription;
  } catch (error) {
    console.error('Error fetching company subscription:', error);
    throw error;
  }
}

export async function getPlans(): Promise<Plan[]> {
  try {
    const plansRef = collection(db, 'plans');
    const plansSnap = await getDocs(plansRef);
    
    if (plansSnap.empty) {
      return DEFAULT_PLANS;
    }

    return plansSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Plan[];
  } catch (error) {
    console.error('Error fetching plans:', error);
    return DEFAULT_PLANS;
  }
}

export async function updateSubscription(
  subscriptionId: string, 
  updates: Partial<Subscription>
): Promise<void> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
    await updateDoc(subscriptionRef, updates);
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(companyId: string): Promise<void> {
  try {
    const subscription = await getCompanySubscription(companyId);
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    await updateSubscription(subscription.id, {
      status: 'cancelled',
      cancelAtPeriodEnd: true
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
} 