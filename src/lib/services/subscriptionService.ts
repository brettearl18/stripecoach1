import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase-admin';
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/config/subscription-plans';

export interface CreateSubscriptionInput {
  customerId: string;
  priceId: string;
  organizationId: string;
  metadata?: Record<string, string>;
}

export interface UpdateSubscriptionInput {
  subscriptionId: string;
  priceId: string;
  prorate?: boolean;
}

export async function createSubscription({
  customerId,
  priceId,
  organizationId,
  metadata = {}
}: CreateSubscriptionInput) {
  try {
    // Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        organizationId,
        ...metadata
      }
    });

    // Store subscription in Firestore
    await db.collection('subscriptions').doc(subscription.id).set({
      id: subscription.id,
      organizationId,
      customerId,
      priceId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata
    });

    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function updateSubscription({
  subscriptionId,
  priceId,
  prorate = true
}: UpdateSubscriptionInput) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Update the subscription
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId,
      }],
      prorate,
    });

    // Update subscription in Firestore
    await db.collection('subscriptions').doc(subscriptionId).update({
      priceId,
      status: updatedSubscription.status,
      currentPeriodStart: new Date(updatedSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000),
      updatedAt: new Date()
    });

    return updatedSubscription;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    // Update subscription in Firestore
    await db.collection('subscriptions').doc(subscriptionId).update({
      cancelAtPeriodEnd: true,
      updatedAt: new Date()
    });

    return subscription;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['customer', 'latest_invoice']
    });
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
}

export async function getOrganizationSubscription(organizationId: string) {
  try {
    const subscriptionDoc = await db.collection('subscriptions')
      .where('organizationId', '==', organizationId)
      .where('status', 'in', ['active', 'trialing'])
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (subscriptionDoc.empty) {
      return null;
    }

    const subscription = subscriptionDoc.docs[0].data();
    return subscription;
  } catch (error) {
    console.error('Error retrieving organization subscription:', error);
    throw error;
  }
}

export async function createCheckoutSession({
  priceId,
  organizationId,
  successUrl,
  cancelUrl
}: {
  priceId: string;
  organizationId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        organizationId
      }
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
} 