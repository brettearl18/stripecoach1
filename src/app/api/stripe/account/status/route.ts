import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  try {
    // Get the current user's ID from the session
    const session = await adminAuth?.verifySessionCookie(request.headers.get('cookie') || '');
    if (!session?.uid) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // Get the coach's document from Firestore
    const coachDoc = await adminDb?.collection('coaches').doc(session.uid).get();
    const stripeAccountId = coachDoc?.data()?.stripeAccountId;

    if (!stripeAccountId) {
      return new NextResponse(JSON.stringify({
        connected: false,
        account: null,
      }));
    }

    // Retrieve the Stripe account
    const account = await stripe.accounts.retrieve(stripeAccountId);

    // Get the account link for the dashboard
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);

    return new NextResponse(JSON.stringify({
      connected: true,
      account: {
        ...account,
        dashboard_url: loginLink.url,
      },
    }));
  } catch (error) {
    console.error('Error checking Stripe account status:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to check Stripe account status' }),
      { status: 500 }
    );
  }
} 