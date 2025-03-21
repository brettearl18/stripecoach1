import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function getPaymentsList(accountId: string, limit = 100) {
  return stripe.paymentIntents.list({
    limit,
    stripeAccount: accountId,
    expand: ['data.customer', 'data.latest_charge'],
  });
}

export async function getPaymentDetails(paymentId: string, accountId: string) {
  return stripe.paymentIntents.retrieve(paymentId, {
    stripeAccount: accountId,
    expand: ['customer', 'latest_charge'],
  });
}

export async function retryPayment(paymentId: string, accountId: string) {
  return stripe.paymentIntents.confirm(paymentId, {
    stripeAccount: accountId,
  });
}

export async function refundPayment(paymentId: string, accountId: string) {
  const payment = await stripe.paymentIntents.retrieve(paymentId, {
    stripeAccount: accountId,
  });
  
  if (payment.latest_charge) {
    return stripe.refunds.create({
      charge: payment.latest_charge as string,
      stripeAccount: accountId,
    });
  }
  throw new Error('No charge found for this payment');
}

export async function getRefundsList(accountId: string, limit = 100) {
  return stripe.refunds.list({
    limit,
    stripeAccount: accountId,
  });
}

export async function getFailedPayments(accountId: string) {
  return stripe.paymentIntents.list({
    stripeAccount: accountId,
    status: 'requires_payment_method',
  });
} 