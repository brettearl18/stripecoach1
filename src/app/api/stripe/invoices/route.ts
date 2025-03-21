import { NextResponse } from 'next/server';
import { getInvoices } from '@/lib/stripe';

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

    const invoices = await getInvoices(customerId);
    return new NextResponse(JSON.stringify(invoices));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to fetch invoices' }),
      { status: 500 }
    );
  }
} 