import { NextResponse } from 'next/server';
import { updateSubscription } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const { subscriptionId, newPriceId } = await request.json();

    if (!subscriptionId || !newPriceId) {
      return new NextResponse(
        JSON.stringify({ error: 'Subscription ID and new price ID are required' }),
        { status: 400 }
      );
    }

    const updatedSubscription = await updateSubscription(subscriptionId, newPriceId);
    return new NextResponse(JSON.stringify(updatedSubscription));
  } catch (error) {
    console.error('Error updating subscription:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update subscription' }),
      { status: 500 }
    );
  }
} 