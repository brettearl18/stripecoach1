import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { SUBSCRIPTION_PLANS } from '@/config/subscription-plans';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { priceId } = body;

    if (!priceId || !SUBSCRIPTION_PLANS[priceId]) {
      return new NextResponse('Invalid price ID', { status: 400 });
    }

    const organization = await db.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { customerId: true },
    });

    if (!organization) {
      return new NextResponse('Organization not found', { status: 404 });
    }

    let customerId = organization.customerId;

    // If no customer ID exists, create a new customer
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email!,
        metadata: {
          organizationId: session.user.organizationId,
        },
      });
      customerId = customer.id;

      await db.organization.update({
        where: { id: session.user.organizationId },
        data: { customerId },
      });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: SUBSCRIPTION_PLANS[priceId].stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
      metadata: {
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 