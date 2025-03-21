import { NextResponse } from 'next/server';
import { getPaymentMethods } from '@/lib/stripe';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return new NextResponse(
        JSON.stringify({ error: 'Customer ID is required' }),
        { status: 400 }
      );
    }

    const paymentMethods = await getPaymentMethods(customerId);
    return new NextResponse(JSON.stringify(paymentMethods));
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch payment methods' }),
      { status: 500 }
    );
  }
} 