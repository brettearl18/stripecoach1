import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const invoice = await stripe.invoices.retrieve(params.id, {
      customer: organization.customerId,
    });

    if (!invoice.invoice_pdf) {
      return new NextResponse('No PDF available', { status: 404 });
    }

    // Redirect to the Stripe-hosted PDF
    return NextResponse.redirect(invoice.invoice_pdf);
  } catch (error) {
    console.error('Error retrieving invoice:', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 