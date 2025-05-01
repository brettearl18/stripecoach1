import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new NextResponse('Webhook signature verification failed', { status: 400 });
    }

    const subscription = event.data.object as Stripe.Subscription;
    const organizationId = subscription.metadata.organizationId;

    if (!organizationId) {
      console.error('No organizationId found in subscription metadata');
      return new NextResponse('No organizationId found in subscription metadata', { status: 400 });
    }

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        // Get the price ID from the subscription
        const priceId = subscription.items.data[0].price.id;
        
        // Map price ID to plan type
        let planType = 'FREE';
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
          planType = 'PRO';
        } else if (priceId === process.env.STRIPE_ELITE_PRICE_ID) {
          planType = 'ELITE';
        }

        // Update organization subscription details
        await db.organization.update({
          where: { id: organizationId },
          data: {
            subscriptionId: subscription.id,
            customerId: subscription.customer as string,
            subscriptionStatus: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            planType: planType
          }
        });
        break;

      case 'customer.subscription.deleted':
        // Revert to FREE plan when subscription is cancelled
        await db.organization.update({
          where: { id: organizationId },
          data: {
            subscriptionId: null,
            subscriptionStatus: 'canceled',
            currentPeriodEnd: null,
            planType: 'FREE'
          }
        });
        break;
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 