import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase-admin';
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
        await db.collection('subscriptions').doc(subscription.id).set({
          id: subscription.id,
          organizationId,
          customerId: subscription.customer as string,
          priceId: subscription.items.data[0].price.id,
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          updatedAt: new Date(),
        });
        break;

      case 'customer.subscription.deleted':
        await db.collection('subscriptions').doc(subscription.id).update({
          status: 'canceled',
          canceledAt: new Date(),
          updatedAt: new Date(),
        });
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await db.collection('subscriptions').doc(invoice.subscription as string).update({
            lastPaymentDate: new Date(),
            lastPaymentAmount: invoice.amount_paid / 100,
            updatedAt: new Date(),
          });
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        if (failedInvoice.subscription) {
          await db.collection('subscriptions').doc(failedInvoice.subscription as string).update({
            lastPaymentError: failedInvoice.last_payment_error?.message,
            updatedAt: new Date(),
          });
        }
        break;
    }

    return new NextResponse('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Webhook processing failed', { status: 500 });
  }
} 