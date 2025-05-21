import { NextResponse } from 'next/server';
import { getOrganizationSubscription } from '@/lib/services/subscriptionService';

export async function GET(request: Request, { params }: { params: { organizationId: string } }) {
  try {
    const subscription = await getOrganizationSubscription(params.organizationId);
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
} 