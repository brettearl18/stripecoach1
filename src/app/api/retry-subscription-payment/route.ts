import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the payment intent to verify it exists and is retryable
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'requires_payment_method') {
      return NextResponse.json(
        { error: 'This payment cannot be retried' },
        { status: 400 }
      );
    }

    // Create a new payment intent for the retry
    const newPaymentIntent = await stripe.paymentIntents.create({
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      customer: paymentIntent.customer as string,
      payment_method_types: ['card'],
      setup_future_usage: 'off_session',
      metadata: {
        original_payment_intent: paymentIntentId,
        is_retry: 'true',
      },
    });

    return NextResponse.json({
      clientSecret: newPaymentIntent.client_secret,
    });
  } catch (err) {
    console.error('Error retrying payment:', err);
    return NextResponse.json(
      { error: 'Failed to process payment retry' },
      { status: 500 }
    );
  }
} 