import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Search for customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
      expand: ['data.subscriptions']
    });

    const customer = customers.data[0];

    if (!customer) {
      return NextResponse.json({ customer: null });
    }

    // Get payment history
    const [payments, charges] = await Promise.all([
      stripe.paymentIntents.list({
        customer: customer.id,
        limit: 100
      }),
      stripe.charges.list({
        customer: customer.id,
        limit: 100
      })
    ]);

    // Calculate payment history stats
    const paymentHistory = {
      total_payments: payments.data.length + charges.data.length,
      total_amount: [
        ...payments.data.map(p => p.amount),
        ...charges.data.map(c => c.amount)
      ].reduce((sum, amount) => sum + amount, 0),
      latest_payment: payments.data[0] || charges.data[0],
      payment_methods: customer.sources?.data || [],
      subscriptions: customer.subscriptions?.data || []
    };

    return NextResponse.json({
      customer,
      paymentHistory
    });
  } catch (error) {
    console.error('Error searching customer:', error);
    return NextResponse.json(
      { error: 'Failed to search customer' },
      { status: 500 }
    );
  }
} 