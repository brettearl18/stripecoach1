import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, getDoc, getDocs, query, where, orderBy, doc } from 'firebase/firestore';
import { stripe } from '@/lib/stripe';

export interface Invoice {
  id: string;
  companyId: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'void';
  dueDate: string;
  items: {
    description: string;
    amount: number;
    quantity: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  companyId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  companyId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  reason: 'requested_by_customer' | 'duplicate' | 'fraudulent';
  notes?: string;
}

export interface RegionalPrice {
  id: string;
  planId: string;
  region: string;
  currency: string;
  amount: number;
  interval: 'month' | 'year';
  createdAt: string;
  updatedAt: string;
}

export interface RevenueReport {
  period: string;
  totalRevenue: number;
  newSubscriptions: number;
  canceledSubscriptions: number;
  activeSubscriptions: number;
  refundAmount: number;
  netRevenue: number;
}

export async function createInvoice(data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const now = new Date().toISOString();
    const invoiceData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    
    const docRef = await addDoc(collection(db, 'invoices'), invoiceData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

export async function processPayment(invoiceId: string, paymentMethod: string): Promise<Payment> {
  try {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const invoiceDoc = await getDoc(invoiceRef);
    
    if (!invoiceDoc.exists()) {
      throw new Error('Invoice not found');
    }
    
    const invoice = { id: invoiceDoc.id, ...invoiceDoc.data() } as Invoice;
    
    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: invoice.amount * 100, // Convert to cents
      currency: 'aud',
      payment_method: paymentMethod,
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/confirm`,
    });
    
    const payment: Payment = {
      id: '', // Will be set by Firestore
      invoiceId,
      companyId: invoice.companyId,
      amount: invoice.amount,
      status: paymentIntent.status === 'succeeded' ? 'completed' : 'pending',
      paymentMethod,
      transactionId: paymentIntent.id,
      createdAt: new Date().toISOString(),
    };
    
    const paymentDoc = await addDoc(collection(db, 'payments'), payment);
    
    // Update invoice status
    await updateDoc(invoiceRef, {
      status: 'paid',
      updatedAt: new Date().toISOString(),
    });
    
    return { ...payment, id: paymentDoc.id };
  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

export async function createSubscription(
  companyId: string,
  planId: string,
  paymentMethod: string
): Promise<Subscription> {
  try {
    // Get company's stripe customer ID or create one
    const companyRef = doc(db, 'companies', companyId);
    const companyDoc = await getDoc(companyRef);
    
    if (!companyDoc.exists()) {
      throw new Error('Company not found');
    }
    
    const company = companyDoc.data();
    let stripeCustomerId = company.stripeCustomerId;
    
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: company.email,
        name: company.name,
        metadata: {
          companyId,
        },
      });
      stripeCustomerId = customer.id;
      await updateDoc(companyRef, { stripeCustomerId });
    }
    
    // Create Stripe subscription
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: planId }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });
    
    const subscription: Subscription = {
      id: '', // Will be set by Firestore
      companyId,
      planId,
      status: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      stripeSubscriptionId: stripeSubscription.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const subscriptionDoc = await addDoc(collection(db, 'subscriptions'), subscription);
    
    return { ...subscription, id: subscriptionDoc.id };
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}

export async function cancelSubscription(subscriptionId: string): Promise<void> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists()) {
      throw new Error('Subscription not found');
    }
    
    const subscription = subscriptionDoc.data() as Subscription;
    
    // Cancel in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    
    // Update in Firestore
    await updateDoc(subscriptionRef, {
      cancelAtPeriodEnd: true,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

export async function getCompanyInvoices(companyId: string): Promise<Invoice[]> {
  try {
    const invoicesRef = collection(db, 'invoices');
    const q = query(
      invoicesRef,
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Invoice[];
  } catch (error) {
    console.error('Error fetching company invoices:', error);
    throw error;
  }
}

export async function getCompanyPayments(companyId: string): Promise<Payment[]> {
  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(
      paymentsRef,
      where('companyId', '==', companyId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Payment[];
  } catch (error) {
    console.error('Error fetching company payments:', error);
    throw error;
  }
}

export async function processRefund(refundData: RefundRequest): Promise<Payment> {
  try {
    const paymentRef = doc(db, 'payments', refundData.paymentId);
    const paymentDoc = await getDoc(paymentRef);
    
    if (!paymentDoc.exists()) {
      throw new Error('Payment not found');
    }
    
    const payment = { id: paymentDoc.id, ...paymentDoc.data() } as Payment;
    
    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: payment.transactionId,
      amount: refundData.amount * 100, // Convert to cents
      reason: refundData.reason,
      metadata: {
        notes: refundData.notes,
      },
    });
    
    // Update payment status in Firestore
    const updatedPayment: Payment = {
      ...payment,
      status: 'refunded',
    };
    
    await updateDoc(paymentRef, updatedPayment);
    
    // Create refund record
    await addDoc(collection(db, 'refunds'), {
      paymentId: payment.id,
      amount: refundData.amount,
      reason: refundData.reason,
      notes: refundData.notes,
      stripeRefundId: refund.id,
      status: refund.status,
      createdAt: new Date().toISOString(),
    });
    
    return updatedPayment;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
}

export async function setRegionalPrice(
  planId: string,
  region: string,
  amount: number,
  currency: string,
  interval: 'month' | 'year'
): Promise<RegionalPrice> {
  try {
    // Create price in Stripe
    const stripePrice = await stripe.prices.create({
      unit_amount: amount * 100,
      currency: currency.toLowerCase(),
      recurring: { interval },
      product: planId,
      metadata: {
        region,
      },
    });
    
    const regionalPrice: RegionalPrice = {
      id: '', // Will be set by Firestore
      planId,
      region,
      currency,
      amount,
      interval,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const priceDoc = await addDoc(collection(db, 'regional_prices'), regionalPrice);
    
    return { ...regionalPrice, id: priceDoc.id };
  } catch (error) {
    console.error('Error setting regional price:', error);
    throw error;
  }
}

export async function getRegionalPrices(planId: string): Promise<RegionalPrice[]> {
  try {
    const pricesRef = collection(db, 'regional_prices');
    const q = query(
      pricesRef,
      where('planId', '==', planId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as RegionalPrice[];
  } catch (error) {
    console.error('Error fetching regional prices:', error);
    throw error;
  }
}

export async function generateRevenueReport(
  startDate: string,
  endDate: string
): Promise<RevenueReport> {
  try {
    const [payments, refunds, subscriptions] = await Promise.all([
      // Get payments for period
      getDocs(
        query(
          collection(db, 'payments'),
          where('createdAt', '>=', startDate),
          where('createdAt', '<=', endDate)
        )
      ),
      // Get refunds for period
      getDocs(
        query(
          collection(db, 'refunds'),
          where('createdAt', '>=', startDate),
          where('createdAt', '<=', endDate)
        )
      ),
      // Get subscription changes for period
      getDocs(
        query(
          collection(db, 'subscriptions'),
          where('createdAt', '>=', startDate),
          where('createdAt', '<=', endDate)
        )
      ),
    ]);
    
    const totalRevenue = payments.docs.reduce(
      (sum, doc) => sum + doc.data().amount,
      0
    );
    
    const refundAmount = refunds.docs.reduce(
      (sum, doc) => sum + doc.data().amount,
      0
    );
    
    const newSubs = subscriptions.docs.filter(
      doc => doc.data().status === 'active'
    ).length;
    
    const canceledSubs = subscriptions.docs.filter(
      doc => doc.data().status === 'canceled'
    ).length;
    
    return {
      period: `${startDate} to ${endDate}`,
      totalRevenue,
      newSubscriptions: newSubs,
      canceledSubscriptions: canceledSubs,
      activeSubscriptions: newSubs - canceledSubs,
      refundAmount,
      netRevenue: totalRevenue - refundAmount,
    };
  } catch (error) {
    console.error('Error generating revenue report:', error);
    throw error;
  }
} 