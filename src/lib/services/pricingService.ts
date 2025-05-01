import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { 
  PricingPlan, 
  Discount, 
  Subscription, 
  PriceUpdate,
  RegionalPricing 
} from '@/types/pricing';

const PLANS_COLLECTION = 'pricingPlans';
const DISCOUNTS_COLLECTION = 'discounts';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const PRICE_UPDATES_COLLECTION = 'priceUpdates';
const REGIONAL_PRICING_COLLECTION = 'regionalPricing';

export const pricingService = {
  // Pricing Plan Management
  async createPlan(plan: Omit<PricingPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<PricingPlan> {
    const planRef = doc(collection(db, PLANS_COLLECTION));
    const newPlan: PricingPlan = {
      ...plan,
      id: planRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(planRef, newPlan);
    return newPlan;
  },

  async getPlan(planId: string): Promise<PricingPlan | null> {
    const planRef = doc(db, PLANS_COLLECTION, planId);
    const planDoc = await getDoc(planRef);
    
    if (!planDoc.exists()) {
      return null;
    }

    return planDoc.data() as PricingPlan;
  },

  async updatePlan(planId: string, updates: Partial<PricingPlan>): Promise<boolean> {
    try {
      const planRef = doc(db, PLANS_COLLECTION, planId);
      await updateDoc(planRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating plan:', error);
      return false;
    }
  },

  async deletePlan(planId: string): Promise<boolean> {
    try {
      const planRef = doc(db, PLANS_COLLECTION, planId);
      await deleteDoc(planRef);
      return true;
    } catch (error) {
      console.error('Error deleting plan:', error);
      return false;
    }
  },

  async listPlans(): Promise<PricingPlan[]> {
    const plansRef = collection(db, PLANS_COLLECTION);
    const plansSnapshot = await getDocs(plansRef);
    
    return plansSnapshot.docs.map(doc => doc.data() as PricingPlan);
  },

  // Discount Management
  async createDiscount(discount: Omit<Discount, 'id' | 'createdAt' | 'updatedAt'>): Promise<Discount> {
    const discountRef = doc(collection(db, DISCOUNTS_COLLECTION));
    const newDiscount: Discount = {
      ...discount,
      id: discountRef.id,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(discountRef, newDiscount);
    return newDiscount;
  },

  async getDiscount(discountId: string): Promise<Discount | null> {
    const discountRef = doc(db, DISCOUNTS_COLLECTION, discountId);
    const discountDoc = await getDoc(discountRef);
    
    if (!discountDoc.exists()) {
      return null;
    }

    return discountDoc.data() as Discount;
  },

  async getDiscountByCode(code: string): Promise<Discount | null> {
    const discountsRef = collection(db, DISCOUNTS_COLLECTION);
    const q = query(discountsRef, where('code', '==', code));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as Discount;
  },

  async updateDiscount(discountId: string, updates: Partial<Discount>): Promise<boolean> {
    try {
      const discountRef = doc(db, DISCOUNTS_COLLECTION, discountId);
      await updateDoc(discountRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating discount:', error);
      return false;
    }
  },

  async incrementDiscountUsage(discountId: string): Promise<boolean> {
    try {
      const discountRef = doc(db, DISCOUNTS_COLLECTION, discountId);
      await updateDoc(discountRef, {
        usageCount: increment(1),
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error incrementing discount usage:', error);
      return false;
    }
  },

  // Subscription Management
  async createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const subscriptionRef = doc(collection(db, SUBSCRIPTIONS_COLLECTION));
    const newSubscription: Subscription = {
      ...subscription,
      id: subscriptionRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(subscriptionRef, newSubscription);
    return newSubscription;
  },

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    const subscriptionRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists()) {
      return null;
    }

    return subscriptionDoc.data() as Subscription;
  },

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const subscriptionsRef = collection(db, SUBSCRIPTIONS_COLLECTION);
    const q = query(subscriptionsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as Subscription);
  },

  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<boolean> {
    try {
      const subscriptionRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId);
      await updateDoc(subscriptionRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating subscription:', error);
      return false;
    }
  },

  // Price Update Management
  async createPriceUpdate(update: Omit<PriceUpdate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PriceUpdate> {
    const updateRef = doc(collection(db, PRICE_UPDATES_COLLECTION));
    const newUpdate: PriceUpdate = {
      ...update,
      id: updateRef.id,
      notificationSent: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(updateRef, newUpdate);
    return newUpdate;
  },

  async getPriceUpdates(planId: string): Promise<PriceUpdate[]> {
    const updatesRef = collection(db, PRICE_UPDATES_COLLECTION);
    const q = query(updatesRef, where('planId', '==', planId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => doc.data() as PriceUpdate);
  },

  // Regional Pricing Management
  async createRegionalPricing(pricing: Omit<RegionalPricing, 'id' | 'createdAt' | 'updatedAt'>): Promise<RegionalPricing> {
    const pricingRef = doc(collection(db, REGIONAL_PRICING_COLLECTION));
    const newPricing: RegionalPricing = {
      ...pricing,
      id: pricingRef.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await setDoc(pricingRef, newPricing);
    return newPricing;
  },

  async getRegionalPricing(planId: string, region: string): Promise<RegionalPricing | null> {
    const pricingRef = collection(db, REGIONAL_PRICING_COLLECTION);
    const q = query(
      pricingRef, 
      where('planId', '==', planId),
      where('region', '==', region)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as RegionalPricing;
  },

  async updateRegionalPricing(pricingId: string, updates: Partial<RegionalPricing>): Promise<boolean> {
    try {
      const pricingRef = doc(db, REGIONAL_PRICING_COLLECTION, pricingId);
      await updateDoc(pricingRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating regional pricing:', error);
      return false;
    }
  }
}; 