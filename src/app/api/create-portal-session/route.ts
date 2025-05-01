import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organizationId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const organization = await db.organization.findUnique({
      where: { id: session.user.organizationId },
      select: { customerId: true },
    });

    if (!organization?.customerId) {
      return new NextResponse('No customer found', { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: organization.customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 