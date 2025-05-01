import { NextResponse } from 'next/server';
import { getPaymentsList, getPaymentDetails, retryPayment, refundPayment } from '@/lib/stripe';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const paymentId = searchParams.get('paymentId');

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    if (paymentId) {
      const payment = await getPaymentDetails(paymentId, accountId);
      return NextResponse.json(payment);
    }

    const payments = await getPaymentsList(accountId);
    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { accountId, paymentId, action } = await request.json();

    if (!accountId || !paymentId || !action) {
      return NextResponse.json(
        { error: 'Account ID, payment ID, and action are required' },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'retry':
        result = await retryPayment(paymentId, accountId);
        break;
      case 'refund':
        result = await refundPayment(paymentId, accountId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing payment action:', error);
    return NextResponse.json(
      { error: 'Failed to process payment action' },
      { status: 500 }
    );
  }
} 