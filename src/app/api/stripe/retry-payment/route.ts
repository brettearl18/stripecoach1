import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase-admin';
import { CreatePaymentRetryHistoryInput } from '@/lib/models/PaymentRetryHistory';

const STRIPE_ERROR_MESSAGES: Record<string, string> = {
  card_declined: 'The card was declined. Please try a different card.',
  expired_card: 'The card has expired. Please update the card information.',
  incorrect_cvc: 'The card\'s security code is incorrect.',
  processing_error: 'An error occurred while processing the card. Please try again.',
  insufficient_funds: 'The card has insufficient funds.',
  invalid_expiry_year: 'The card\'s expiration year is invalid.',
  invalid_expiry_month: 'The card\'s expiration month is invalid.',
  invalid_number: 'The card number is invalid.',
  invalid_cvc: 'The card\'s security code is invalid.',
  authentication_required: 'This transaction requires authentication.',
  rate_limit: 'Too many requests made to the API too quickly.',
};

async function logPaymentRetry(input: CreatePaymentRetryHistoryInput) {
  try {
    await db.collection('paymentRetryHistory').add({
      ...input,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error logging payment retry:', error);
  }
}

export async function POST(request: Request) {
  try {
    const { customerId, amount, paymentMethodId, clientId, clientName, originalPaymentId, retriedBy } = await request.json();

    if (!customerId || !amount || !paymentMethodId || !clientId || !clientName || !originalPaymentId || !retriedBy) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get payment method details for logging
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    const paymentMethodDetails = {
      brand: paymentMethod.card?.brand || 'unknown',
      last4: paymentMethod.card?.last4 || '****',
    };

    try {
      // Create a new payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true,
        off_session: true,
        setup_future_usage: 'off_session',
      });

      // Log successful payment retry
      await logPaymentRetry({
        clientId,
        clientName,
        amount,
        originalPaymentId,
        retryPaymentId: paymentIntent.id,
        status: 'succeeded',
        paymentMethodId,
        paymentMethodDetails,
        retriedBy,
      });

      return NextResponse.json({ paymentIntent });
    } catch (stripeError: any) {
      // Get user-friendly error message
      const errorMessage = STRIPE_ERROR_MESSAGES[stripeError.code] || stripeError.message;

      // Log failed payment retry
      await logPaymentRetry({
        clientId,
        clientName,
        amount,
        originalPaymentId,
        retryPaymentId: stripeError.payment_intent?.id || 'unknown',
        status: 'failed',
        errorCode: stripeError.code,
        errorMessage,
        paymentMethodId,
        paymentMethodDetails,
        retriedBy,
      });

      return NextResponse.json(
        {
          error: errorMessage,
          code: stripeError.code,
          type: stripeError.type,
          paymentIntent: stripeError.payment_intent,
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error processing retry payment:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while processing the payment.',
        details: error.message
      },
      { status: 500 }
    );
  }
} 