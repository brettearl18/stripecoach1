import Stripe from 'stripe';

// Mock key for development
const MOCK_STRIPE_KEY = 'sk_test_mock_key_for_development_only';

// Use mock key in development, real key in production
const stripeKey = process.env.NODE_ENV === 'development' 
  ? MOCK_STRIPE_KEY 
  : process.env.STRIPE_SECRET_KEY;

if (!stripeKey && process.env.NODE_ENV === 'production') {
  throw new Error('STRIPE_SECRET_KEY is not defined in production environment');
}

export const stripe = new Stripe(stripeKey || MOCK_STRIPE_KEY, {
  apiVersion: '2023-10-16',
});

// Mock data for development
const mockPaymentData = {
  id: 'mock_payment_id',
  amount: 1000,
  currency: 'usd',
  status: 'succeeded',
  customer: {
    id: 'mock_customer_id',
    name: 'Test Customer',
    email: 'test@example.com'
  }
};

export async function getPaymentsList(accountId: string, limit = 100) {
  if (process.env.NODE_ENV === 'development') {
    return {
      data: Array(5).fill(mockPaymentData),
      has_more: false,
      total_count: 5
    };
  }
  return stripe.paymentIntents.list({
    limit,
    stripeAccount: accountId,
    expand: ['data.customer', 'data.latest_charge'],
  });
}

export async function getPaymentDetails(paymentId: string, accountId: string) {
  if (process.env.NODE_ENV === 'development') {
    return mockPaymentData;
  }
  return stripe.paymentIntents.retrieve(paymentId, {
    stripeAccount: accountId,
    expand: ['customer', 'latest_charge'],
  });
}

export async function retryPayment(paymentId: string, accountId: string) {
  if (process.env.NODE_ENV === 'development') {
    return { ...mockPaymentData, status: 'succeeded' };
  }
  return stripe.paymentIntents.confirm(paymentId, {
    stripeAccount: accountId,
  });
}

export async function refundPayment(paymentId: string, accountId: string) {
  if (process.env.NODE_ENV === 'development') {
    return { 
      id: 'mock_refund_id',
      amount: mockPaymentData.amount,
      status: 'succeeded'
    };
  }

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
  if (process.env.NODE_ENV === 'development') {
    return {
      data: Array(3).fill({
        id: 'mock_refund_id',
        amount: 1000,
        status: 'succeeded'
      }),
      has_more: false
    };
  }
  return stripe.refunds.list({
    limit,
    stripeAccount: accountId,
  });
}

export async function getFailedPayments(accountId: string) {
  if (process.env.NODE_ENV === 'development') {
    return {
      data: Array(2).fill({
        ...mockPaymentData,
        status: 'requires_payment_method'
      }),
      has_more: false
    };
  }
  return stripe.paymentIntents.list({
    stripeAccount: accountId,
    status: 'requires_payment_method',
  });
}

export async function getInvoices(accountId: string, limit = 100) {
  if (process.env.NODE_ENV === 'development') {
    return {
      data: Array(5).fill({
        id: 'mock_invoice_id',
        amount_due: 1000,
        status: 'paid',
        customer: {
          id: 'mock_customer_id',
          name: 'Test Customer',
          email: 'test@example.com'
        }
      }),
      has_more: false
    };
  }
  return stripe.invoices.list({
    limit,
    stripeAccount: accountId,
    expand: ['data.customer'],
  });
}

export async function getPaymentMethods(accountId: string, limit = 100) {
  if (process.env.NODE_ENV === 'development') {
    return {
      data: Array(2).fill({
        id: 'mock_payment_method_id',
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
          exp_month: 12,
          exp_year: 2024
        }
      }),
      has_more: false
    };
  }
  return stripe.paymentMethods.list({
    limit,
    stripeAccount: accountId,
    type: 'card',
  });
}

export async function updateSubscription(subscriptionId: string, accountId: string, updates: any) {
  if (process.env.NODE_ENV === 'development') {
    return {
      id: 'mock_subscription_id',
      status: 'active',
      current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000,
      ...updates
    };
  }
  return stripe.subscriptions.update(subscriptionId, {
    stripeAccount: accountId,
    ...updates
  });
} 