import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    // Get the current user's ID from the session
    const session = await adminAuth?.verifySessionCookie(request.headers.get('cookie') || '');
    if (!session?.uid) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Create or retrieve the Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Store the Stripe account ID in Firestore
    await adminDb?.collection('coaches').doc(session.uid).update({
      stripeAccountId: account.id,
    });

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/settings?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/settings?success=true`,
      type: 'account_onboarding',
    });

    return new NextResponse(JSON.stringify({ url: accountLink.url }));
  } catch (error) {
    console.error('Error creating Stripe account:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create Stripe account' }),
      { status: 500 }
    );
  }
} 