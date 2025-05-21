import { NextResponse } from 'next/server';
import { getCompanySubscription } from '@/lib/services/subscriptionService';

export async function GET(request: Request, { params }: { params: { companyId: string } }) {
  try {
    const subscription = await getCompanySubscription(params.companyId);
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error fetching company subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch company subscription' }, { status: 500 });
  }
} 